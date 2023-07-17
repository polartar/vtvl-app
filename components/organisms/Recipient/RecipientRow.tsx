import RecipientApiService from '@api-services/RecipientApiService';
import Button from '@components/atoms/Button/Button';
import Copy from '@components/atoms/Copy/Copy';
import { EditableTypography } from '@components/molecules/RecipientTable';
import format from 'date-fns/format';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { IRecipientData, RecipeStatus } from 'types/models/recipient';
import { compareAddresses } from 'utils';
import { validateEmail } from 'utils/validator';

import { isExpired, sendRecipientInvite } from '.';

const RecipientRow: React.FC<{
  recipient: IRecipientData;
  symbol: string;
  vestingSchedulesInfo: VestingContractInfo[];
  setCheck: (checked: boolean, id: string) => void;
}> = ({ recipient, symbol, vestingSchedulesInfo, setCheck }) => {
  const [newRecipient, setNewRecipient] = useState(recipient);

  useEffect(() => {
    setNewRecipient(recipient);
  }, [recipient]);

  const [isUpdating, setIsUpdating] = useState(false);
  const getRecipientInfo = useCallback(
    (wallet: string) => {
      return vestingSchedulesInfo.find((vestingInfo) => compareAddresses(vestingInfo.recipient, wallet));
    },
    [vestingSchedulesInfo]
  );

  const formatValue = (value: BigNumber | undefined) => {
    return value ? Number(formatEther(value)).toFixed(2) : 0;
  };

  const getStatusLabel = () => {
    if (newRecipient.email && newRecipient.address) {
      return '';
    } else if (newRecipient.status === RecipeStatus.ACCEPTED) {
      return 'Accepted';
    } else if (newRecipient.status === RecipeStatus.PENDING) {
      if (isExpired(newRecipient.updatedAt)) {
        return 'Expired';
      } else {
        return 'Delivered';
      }
    } else {
      return 'Delivered';
    }
  };

  const getStatusStyle = () => {
    const status = getStatusLabel();

    if (status === 'Accepted') {
      return 'bg-[#c8ffef] text-[#22c55e]';
    } else if (status === 'Delivered') {
      return 'bg-[#eaecf0] text-[#667085]';
    } else if (status === 'Expired') {
      return 'bg-[#fee2e2] text-[#ef4444]';
    } else {
      return '';
    }
  };

  const onChangeEmail = (email: string) => {
    if (email === newRecipient.email) return;
    if (validateEmail(email).validated) {
      setNewRecipient({
        ...newRecipient,
        email
      });
      setIsUpdating(true);
      RecipientApiService.updateRecipient(newRecipient.id, { ...newRecipient, email })
        .then(() => {
          toast.success(`E-mail address successfully amended!`);
        })
        .catch(() => {
          toast.error('Something went wrong');
        })
        .finally(() => {
          setIsUpdating(false);
        });
    }
  };

  const sendInvite = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await sendRecipientInvite(
        [
          {
            email: recipient.email,
            name: recipient.name || '',
            orgId: recipient.organizationId,
            memberId: recipient.id
          }
        ],
        symbol
      );
      toast.success('Invited recipient successfully');
    } catch (err) {
      toast.error('Something went wrong');
    }
    setIsUpdating(false);
  };

  return (
    <>
      <div className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd]">
        <div className="flex  bg-[#f9fafb] text-[#667085] text-xs border-t border-[#d0d5dd]">
          <div className="flex items-center w-16 py-3 pl-3">
            <input
              type="checkbox"
              checked={newRecipient.checked}
              onChange={(e) => setCheck(e.target.checked, recipient.id)}
            />
          </div>
          <div className="flex items-center w-36 py-3">{newRecipient.name}</div>
          <div className="flex items-center w-52 py-3">
            {getStatusLabel() !== 'Expired' && getStatusLabel() !== 'Delivered' && recipient.email ? (
              recipient.email
            ) : (
              <EditableTypography
                id={`${newRecipient.id}-email`}
                initialValue={newRecipient.email}
                autoFocus
                type="text"
                placeholder="eg. vitalik@vtvl.io"
                validations={['required', 'email']}
                isNoPadding={true}
                onChange={onChangeEmail}
              />
            )}
          </div>
          <div className="flex items-center w-52 py-3">
            <Copy text={newRecipient.address || ''}>
              <p className="paragraphy-small ">
                {newRecipient.address?.slice(0, 5)}...{newRecipient.address?.slice(-4)}
              </p>
            </Copy>
          </div>
          <div className="flex items-center w-40 py-3">
            {getStatusLabel() === ''
              ? ''
              : newRecipient.updatedAt
              ? format(new Date(newRecipient.updatedAt).getTime(), 'dd/MM/yyyy')
              : ''}
          </div>
          <div className={`flex items-center w-32 py-3 `}>
            <div className={` font-medium py-2 px-3 rounded-3xl ${getStatusStyle()}`}>{getStatusLabel()}</div>
          </div>
          <div className="flex items-center w-40 py-3">
            {formatValue(getRecipientInfo(newRecipient.address || '')?.locked)}
          </div>
          <div className="flex items-center w-40 py-3">
            {formatValue(getRecipientInfo(newRecipient.address || '')?.allocation)}
          </div>
          <div className="flex items-center w-[150px] flex-grow py-3">
            <Button
              loading={isUpdating}
              className="w-full rounded-lg primary mr-1"
              onClick={() => sendInvite()}
              disabled={!!(recipient.email && recipient.address)}>
              {isUpdating ? '...' : 'Resend invite'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipientRow;
