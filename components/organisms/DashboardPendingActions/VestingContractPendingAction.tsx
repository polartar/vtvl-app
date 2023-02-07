import { injected } from '@connectors/index';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import {
  IStatus,
  ITransactionStatus,
  STATUS_MAPPING,
  TRANSACTION_STATUS_MAPPING
} from 'components/organisms/DashboardPendingActions';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useState } from 'react';
import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting, IVestingContract } from 'types/models';
import { formatNumber, parseTokenAmount } from 'utils/token';

const VestingContractPendingAction: React.FC<{ id: string; data: IVestingContract }> = ({ id, data }) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  // const { fetchDashboardVestingContract } = useDashboardContext();
  const { setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();

  const [status, setStatus] = useState<IStatus>('');

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
            status: 'PENDING',
            deployer: account,
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          id
        );

        setTransactionStatus('SUCCESS');
        // fetchDashboardVestingContract();
        if (safe?.address) {
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
        const transactionResponse = await vestingContract.setAdmin(safe?.address, true);
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
        safe &&
        safe.address &&
        safe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())
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
    } else if (data.status === 'PENDING' && safe) {
      const VestingContract = new ethers.Contract(
        data.address,
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      VestingContract.isAdmin(safe.address).then((res: any) => {
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
  }, [data, safe, account]);

  return status === 'SUCCESS' ? null : (
    <div className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd]">
      <div className="flex items-center w-16 py-3"></div>
      <div className="flex items-center w-36 py-3">{data.name}</div>
      <div className="flex items-center w-52 py-3">Contract Deployment</div>
      <div className="flex items-center w-52 py-3">
        {!!status && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3">{data.name}</div>
      <div className="flex items-center w-32 py-3">
        <div className="flex gap-1.5 items-center">
          <img className="w-4 h-4" src="icons/safe.png" />
          Founders
        </div>
      </div>
      <div className="flex items-center w-40 py-3"></div>
      <div className="flex items-center min-w-[200px] flex-grow py-3">
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
  );
};

export default VestingContractPendingAction;
