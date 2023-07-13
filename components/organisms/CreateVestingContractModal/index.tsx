import VestingContractApiService from '@api-services/VestingContractApiService';
import Input from '@components/atoms/FormControls/Input/Input';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useOrganization } from '@store/useOrganizations';
import { useWeb3React } from '@web3-react/core';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createVestingContract } from 'services/db/vestingContract';

interface ICreateVestingContractModal {
  hideModal: () => void;
}

const CreateVestingContractModal: React.FC<ICreateVestingContractModal> = ({ hideModal }) => {
  const { chainId } = useWeb3React();
  const { organizationId } = useOrganization();
  const { vestingContracts, updateVestingContract } = useDashboardContext();
  const { mintFormState } = useTokenContext();

  const [contractName, setContractName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateVestingContract = async () => {
    try {
      if (!contractName) {
        setError('Contract name is required.');
        return;
      }
      if (organizationId) {
        if (
          vestingContracts &&
          vestingContracts.length > 0 &&
          vestingContracts.find((vestingContract) => vestingContract.name === contractName)
        ) {
          setError('A contract with the same name already exists.');
          return;
        }
        setLoading(true);
        const vestingContract = await VestingContractApiService.createVestingContract({
          name: contractName,
          tokenId: mintFormState.id ?? '',
          organizationId,
          chainId: chainId ?? 0
        });
        // fetchDashboardVestingContract();
        updateVestingContract(vestingContract);
        setLoading(false);
        hideModal();
        toast.success(
          <>
            Contract <strong>{contractName}</strong> created!
          </>
        );
      }
    } catch (err) {
      console.log('handleCreateVestingContract - ', err);
      setError('Something went wrong. Try again later.');
    }
  };

  return (
    <div className="max-w-[560px] w-full p-6 rounded-3xl border border-neutral-300 bg-white text-center">
      <h1 className="mt-4 text-2xl font-semibold text-gray-800 leading-[1.7]">Create a new vesting contract</h1>
      <h2 className="w-full text-sm text-[#344054]">
        Our vesting contract is built separately to the ERC-20 token contract for added security and flexibility.
      </h2>
      <div className="flex items-center text-sm text-neutral-500 mt-5">
        <img className="mr-2" src="/icons/create-contract.svg" />
        Contract name <span className="text-secondary-900">*</span>
      </div>
      <div className="w-full mt-3">
        <Input
          value={contractName}
          onChange={(e) => {
            setError('');
            setContractName(e.target.value);
          }}
        />
      </div>
      {!!error && <p className="mt-3 ml-4 text-left text-red-500 text-xs">{error}</p>}
      <div className="w-full h-[1px] mt-5 bg-neutral-200" />
      <div className="mt-8 w-full flex justify-between">
        <button className="line primary row-center" onClick={hideModal}>
          <span className="whitespace-nowrap font-medium">Cancel</span>
        </button>
        <button className="secondary row-center" onClick={handleCreateVestingContract}>
          <span className={`whitespace-nowrap ${loading && 'loading'}`}>Create Contract</span>
        </button>
      </div>
    </div>
  );
};

export default CreateVestingContractModal;
