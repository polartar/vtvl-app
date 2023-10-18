import APIKeyService from '@api-services/APIKeyService';
import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Copy from '@components/atoms/Copy/Copy';
import { PlusIcon } from '@components/atoms/Icons';
import { useModal } from '@hooks/useModal';
import { useAuthContext } from '@providers/auth.context';
import { useQuery } from '@tanstack/react-query';
import format from 'date-fns/format';
import { IAPIKey } from 'interfaces/apiKey';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from 'utils/queries';

const APIKeyPage = () => {
  const { organizationId } = useAuthContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { ModalWrapper, showModal, hideModal } = useModal({});
  const [currentKeyId, setCurrentKeyId] = useState('');
  const [refresh, setRefresh] = useState(false);

  const { isLoading, data: keys } = useQuery<IAPIKey[]>(
    [QUERY_KEYS.API_KEYS.GET_KEYS, refresh],
    () => APIKeyService.getAPIKeys(organizationId),
    {
      enabled: !!organizationId,
      refetchOnWindowFocus: false
    }
  );
  const createNewKey = async () => {
    if (organizationId) {
      try {
        setIsCreating(true);
        await APIKeyService.createAPIKey({ organizationId });
        setRefresh(!refresh);
        toast.success('A new key is created');
      } catch (err: any) {
        toast.error(err.message);
      }
      setIsCreating(false);
    } else {
      toast.error('OrganizationId is empty');
    }
  };

  const removeKeyModal = (id: string) => {
    setCurrentKeyId(id);
    showModal();
  };
  const removeKey = async () => {
    if (currentKeyId) {
      try {
        setIsRemoving(true);
        if (organizationId) await APIKeyService.deleteAPIKey(organizationId, currentKeyId);
        setRefresh(!refresh);
      } catch (err: any) {
        toast.error(err.message);
      }
      setIsRemoving(false);
      hideModal();
    } else {
      toast.error('Please select the correct key to remove');
    }
  };

  return (
    <div className="w-full grid grid-cols-12 gap-3 px-6">
      <div className="lg:col-span-3 col-span-12">
        <div>
          <h1 className="h2 font-normal ">API Token</h1>
          <p className=" text-gray-500 text-sm">View, add and delete API keys</p>
        </div>
      </div>

      <div className="lg:col-span-9 col-span-12">
        <div className="flex justify-end">
          <div className=" w-56">
            <Button className="w-full rounded-lg" primary onClick={() => createNewKey()} loading={isCreating}>
              <div className="flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                <span className="whitespace-nowrap">Create a new API Key</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="border border-[#d0d5dd] rounded-xl w-full overflow-hidden mt-3">
          <div className="flex bg-[#f2f4f7] text-[#475467] text-xs px-4 justify-between">
            <div className=" w-72 py-3">Token</div>
            <div className="w-32 py-3">Date created</div>
            <div className="w-40 py-3">Action</div>
          </div>
          {isLoading ? (
            Array.from(new Array(3)).map((_, index) => (
              <div className="animate-pulse mt-2 w-full">
                <div className="bg-neutral-100 h-[33px]  rounded-10"></div>
              </div>
            ))
          ) : !keys || keys.length === 0 ? (
            <div className="p-4 text-center"> No key created</div>
          ) : (
            keys?.map((key) => (
              <div
                className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd] justify-between px-4 "
                key={key.id}>
                <div className="flex items-center w-72  py-3">
                  <Copy text={key.key} children={<>{key.key}</>}></Copy>
                </div>

                <div className="flex items-center w-32 py-3">
                  {format(new Date(key.createdAt), 'yyyy-MM-dd hh-mm-ss')}
                </div>
                <div className={`flex items-center w-40 py-3 justify-start`}>
                  <Button className="w-full rounded-lg mr-1" danger outline onClick={() => removeKeyModal(key.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ModalWrapper>
        <div className="max-w-[560px] w-full p-6 rounded-3xl border border-neutral-300 bg-white text-center">
          <h1 className="mt-4 text-2xl font-semibold text-gray-800 leading-[1.7]">Remove API Key</h1>
          <h2 className="w-full text-base text-[#667085]">Are you sure want to remove this key?</h2>

          <div className="w-full h-[1px] mt-5 bg-neutral-200" />
          <div className="mt-8 w-full flex justify-between">
            <BackButton label="Cancel" onClick={hideModal} />

            <Button type="submit" className="danger" onClick={removeKey} loading={isRemoving}>
              Remove
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default APIKeyPage;
