import { injected } from '@connectors/index';
import { useAuthContext } from '@providers/auth.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { IStatus, STATUS_MAPPING } from 'components/organisms/DashboardPendingActions';
import VTVL_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import { ethers } from 'ethers';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useState } from 'react';
import { updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVestingContract } from 'types/models';

interface IVestingContractPendingActionProps {
  id: string;
  data: IVestingContract;
  filter: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  };
  updateFilter: (v: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  }) => void;
}

const VestingContractPendingAction: React.FC<IVestingContractPendingActionProps> = ({
  id,
  data,
  filter,
  updateFilter
}) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  // const { fetchDashboardVestingContract } = useDashboardContext();
  const { setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();

  const [status, setStatus] = useState<IStatus>('');

  const shouldShow =
    filter.status === 'ALL' ||
    (filter.status === 'FUND' && status === 'FUNDING_REQUIRED') ||
    (filter.status === 'TRANSFER_OWNERSHIP' &&
      (status === 'REMOVE_ORIGINAL_OWNERSHIP' || status === 'TRANSFER_OWNERSHIP'));

  const handleDeployVestingContract = async () => {
    setIsCloseAvailable(false);
    try {
      if (!account || !chainId) {
        activate(injected);
        return;
      } else if (organizationId) {
        setTransactionStatus('PENDING');
        const vestingContractInterface = new ethers.utils.Interface(VTVL_VESTING_ABI.abi);
        const vestingContractEncoded = vestingContractInterface.encodeDeploy([mintFormState.address]);
        const VestingFactory = new ethers.ContractFactory(
          VTVL_VESTING_ABI.abi,
          VTVL_VESTING_ABI.bytecode + vestingContractEncoded.slice(2),
          library.getSigner()
        );
        const vestingContract = await VestingFactory.deploy(mintFormState.address);
        setTransactionStatus('IN_PROGRESS');
        await vestingContract.deployed();
        const vestingContractId = await updateVestingContract(
          {
            ...data,
            tokenAddress: mintFormState.address,
            address: vestingContract.address,
            status: currentSafe?.address ? 'PENDING' : 'SUCCESS',
            deployer: account,
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          id
        );

        setTransactionStatus('SUCCESS');
        // fetchDashboardVestingContract();
        if (currentSafe?.address) {
          setStatus('TRANSFER_OWNERSHIP');
        } else {
          setStatus('SUCCESS');
        }
      }
    } catch (err) {
      console.log('handleDeployVestingContract - ', err);
      setTransactionStatus('ERROR');
    }
  };

  const handleTransferOwnership = async () => {
    try {
      setIsCloseAvailable(false);
      if (organizationId && chainId) {
        setTransactionStatus('PENDING');

        const vestingContract = new ethers.Contract(data.address, VTVL_VESTING_ABI.abi, library.getSigner());
        const transactionResponse = await vestingContract.setAdmin(currentSafe?.address, true);
        setTransactionStatus('IN_PROGRESS');
        await transactionResponse.wait();
        setStatus('REMOVE_ORIGINAL_OWNERSHIP');
        setTransactionStatus('SUCCESS');
        // fetchDashboardVestingContract();
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
      setTransactionStatus('ERROR');
    }
  };

  const handleRemoveDeployerOwnership = async () => {
    try {
      setIsCloseAvailable(false);
      if (!account || !library || !chainId) {
        activate(injected);
        return;
      }

      if (
        organizationId &&
        currentSafe &&
        currentSafe.address &&
        currentSafe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())
      ) {
        setTransactionStatus('PENDING');
        const vestingContract = new ethers.Contract(data.address, VTVL_VESTING_ABI.abi, library.getSigner());
        const transactionResponse = await vestingContract.setAdmin(account, false);
        setTransactionStatus('IN_PROGRESS');
        await transactionResponse.wait();
        await updateVestingContract(
          {
            ...data,
            status: 'SUCCESS',
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          id
        );
        setStatus('SUCCESS');
        setTransactionStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
      setTransactionStatus('ERROR');
    }
  };

  useEffect(() => {
    if (data.status === 'INITIALIZED') {
      setStatus('AUTHORIZATION_REQUIRED');
    } else if (data.status === 'PENDING' && currentSafe) {
      const VestingContract = new ethers.Contract(
        data.address,
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      VestingContract.isAdmin(currentSafe.address).then((res: any) => {
        if (!res) {
          setStatus('TRANSFER_OWNERSHIP');
          return;
        } else {
          VestingContract.isAdmin(account).then((res1: any) => {
            if (res1) {
              setStatus('REMOVE_ORIGINAL_OWNERSHIP');
              return;
            } else {
              setStatus('SUCCESS');
              return;
            }
          });
        }
      });
    } else {
      setStatus('SUCCESS');
    }
  }, [data, currentSafe, account]);

  return status === 'SUCCESS' ? null : shouldShow ? (
    <div className="flex bg-white text-[#667085] text-xs">
      <div className="flex items-center w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{data.name}</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">Contract Deployment</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {!!status && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap"
            onClick={() => {
              updateFilter({
                ...filter,
                status:
                  status === 'TRANSFER_OWNERSHIP' || status === 'REMOVE_ORIGINAL_OWNERSHIP'
                    ? 'TRANSFER_OWNERSHIP'
                    : status === 'AUTHORIZATION_REQUIRED'
                    ? 'DEPLOY_VESTING_CONTRACT'
                    : 'ALL'
              });
            }}>
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{data.name}</div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {currentSafe ? (
          <div className="flex gap-1.5 items-center">
            <img className="w-4 h-4" src="icons/safe_wallet.svg" />
            {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
          </div>
        ) : (
          'N/A'
        )}
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center min-w-[200px] flex-grow py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {status === 'AUTHORIZATION_REQUIRED' ? (
          <button className="secondary small" onClick={handleDeployVestingContract}>
            Deploy
          </button>
        ) : status === 'TRANSFER_OWNERSHIP' ? (
          <button className="secondary small" onClick={handleTransferOwnership}>
            Transfer Ownership
          </button>
        ) : status === 'REMOVE_ORIGINAL_OWNERSHIP' ? (
          <button className="secondary small whitespace-nowrap" onClick={handleRemoveDeployerOwnership}>
            Remove Original Ownership
          </button>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default VestingContractPendingAction;
