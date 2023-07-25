import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import Chip from 'components/atoms/Chip/Chip';
import StepWizard from 'components/atoms/StepWizard/StepWizard';
import ContractOverview from 'components/molecules/ContractOverview/ContractOverview';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import { ethers } from 'ethers';
import { useAuthContext } from 'providers/auth.context';
import { useTokenContext } from 'providers/token.context';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { createVestingContract, fetchVestingContractByQuery } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';

interface AddVestingSchedulesProps {
  className?: string;
  // status:
  //   | 'authRequired'
  //   | 'vestingContractRequired'
  //   | 'transferToMultisigSafe'
  //   | 'fundingRequired'
  //   | 'fundingInProgress'
  //   | 'approved'
  //   | 'declined';
  // schedule?: IScheduleOverviewProps;
  // contract?: IVestingContractProps;
  // step?: number;
  // className?: string;
  // onPrimaryClick?: () => void;
  // onSecondaryClick?: () => void;
  type: string;
}

interface AddVestingSchedulesStatuses {
  icon: string | JSX.Element | React.ReactNode;
  label: string;
  actions?: JSX.Element | React.ReactNode;
}

/**
 * Dashboard Panel component caters two types of item
 * 1. Contract - displays an overview details of the contract
 * 2. Schedule - displays an overview details of the schedule
 * Each type display different heading portion (status) and actions (buttons)
 *
 * Statuses:
 * - authRequired - has confirmation steps - based on number of approvals
 * - vestingContractRequired
 * - transferToMultisigSafe
 * - fundingRequired
 * - fundingInProgress - has confirmation steps - based on number of approvals
 * - approved
 * - declined
 *
 * onPrimaryClick - is an event when triggering the primary CTA for the panel
 * onSecondaryClick - is an event when triggering the secondary CTA -- normally "View details" etc.
 *
 */

const AddVestingSchedules = ({ className = '', type }: AddVestingSchedulesProps) => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip

  const { account, library, activate, chainId } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { vestings, setOwnershipTransfered, setRemoveOwnership } = useDashboardContext();
  const { pendingTransactions, setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();

  const [activeVestingIndex, setActiveVestingIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [transaction, setTransaction] = useState<ITransaction | undefined>();

  const isCreateAvailable = useCallback(() => {
    const vestingTransaction = pendingTransactions.find(
      (transaction) => transaction.data.type === 'VESTING_DEPLOYMENT'
    );
    return !vestingTransaction;
  }, [pendingTransactions]);

  const handleDeployVestingContract = async () => {
    try {
      if (!account || !chainId) {
        activate(injected);
        return;
      } else if (organizationId) {
        setIsCloseAvailable(false);

        setTransactionStatus('PENDING');
        const vestingContractInterface = new ethers.utils.Interface(VTVL_VESTING_ABI.abi);
        const vestingContractEncoded = vestingContractInterface.encodeDeploy([mintFormState.address]);
        const VestingFactory = new ethers.ContractFactory(
          VTVL_VESTING_ABI.abi,
          VTVL_VESTING_ABI.bytecode + vestingContractEncoded.slice(2),
          library.getSigner()
        );
        const vestingContract = await VestingFactory.deploy(mintFormState.address);

        const transactionData: ITransaction = {
          hash: vestingContract.deployTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: '',
          type: 'VESTING_DEPLOYMENT',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds: []
        };
        const transactionId = await createTransaction(transactionData);

        setTransactionStatus('IN_PROGRESS');
        await vestingContract.deployed();
        const vestingContractId = await createVestingContract({
          tokenAddress: mintFormState.address,
          address: vestingContract.address,
          status: 'SUCCESS',
          deployer: account,
          organizationId,
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          chainId,
          name: '',
          transactionId: ''
        });
        // Ensure that the initial vesting schedule record is also updated
        // Since vesting contract is being created, status should be CREATED
        if (vestings && vestings[activeVestingIndex]) {
          await updateVesting(
            {
              ...vestings[activeVestingIndex].data,
              status: 'CREATED',
              vestingContractId,
              updatedAt: Math.floor(new Date().getTime() / 1000)
            },
            vestings[activeVestingIndex].id
          );
        }
        transactionData.status = 'SUCCESS';
        updateTransaction(transactionData, transactionId);
        setTransactionStatus('SUCCESS');
        // fetchDashboardVestingContract();
        if (!currentSafe?.address) {
          setStatus('success');
        } else setStatus('transferToMultisigSafe');
      }
    } catch (err) {
      console.log('handleDeployVestingContract - ', err);
      setTransactionStatus('ERROR');
    }
  };

  const handleTransferOwnership = async () => {
    try {
      if (organizationId && chainId) {
        setIsCloseAvailable(false);

        setTransactionStatus('PENDING');
        const vestingContractData = await fetchVestingContractByQuery(
          ['organizationId', 'chainId'],
          ['==', '=='],
          [organizationId, chainId]
        );
        if (vestingContractData?.data) {
          const vestingContract = new ethers.Contract(
            vestingContractData?.data?.address,
            VTVL_VESTING_ABI.abi,
            library.getSigner()
          );
          const transactionResponse = await vestingContract.setAdmin(currentSafe?.address, true);
          setTransactionStatus('IN_PROGRESS');
          await transactionResponse.wait();
          setStatus('success');
          setOwnershipTransfered(true);
          setTransactionStatus('SUCCESS');
        }
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
      setTransactionStatus('ERROR');
    }
  };

  const handleRemoveDeployerOwnership = async () => {
    try {
      if (!account || !library || !chainId) {
        activate(injected);
        return;
      }

      if (
        organizationId &&
        currentSafe?.address &&
        account.toLowerCase() === currentSafe?.owners[0].address.toLowerCase()
      ) {
        setIsCloseAvailable(false);

        setTransactionStatus('PENDING');
        const vestingContractData = await fetchVestingContractByQuery(
          ['organizationId', 'chainId'],
          ['==', '=='],
          [organizationId, chainId]
        );
        if (vestingContractData?.data) {
          const vestingContract = new ethers.Contract(
            vestingContractData?.data?.address,
            VTVL_VESTING_ABI.abi,
            library.getSigner()
          );
          const transactionResponse = await vestingContract.setAdmin(account, false);
          setTransactionStatus('IN_PROGRESS');
          await transactionResponse.wait();
          setStatus('success');
          setRemoveOwnership(false);
          setTransactionStatus('SUCCESS');
        }
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
      setTransactionStatus('ERROR');
    }
  };

  const statuses: Record<string, AddVestingSchedulesStatuses> = {
    vestingContractRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Vesting contract required',
      actions: (
        <>
          <button className="secondary" onClick={handleDeployVestingContract} disabled={!isCreateAvailable()}>
            Create vesting contract
          </button>
        </>
      )
    },
    transferToMultisigSafe: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Transfer Ownership to Multisig',
      actions: (
        <>
          <button className="line primary" disabled onClick={() => {}}>
            Create vesting contract
          </button>
          <button className="black row-center" onClick={handleTransferOwnership}>
            <img src="/images/multi-sig.png" className="w-6 h-6" aria-hidden="true" />
            Transfer ownership to Multi-sig Safe
          </button>
        </>
      )
    },
    removeOwnership: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: "Remove deployer's ownership",
      actions: (
        <>
          <button className="black row-center" onClick={handleRemoveDeployerOwnership}>
            <img src="/images/multi-sig.png" className="w-6 h-6" aria-hidden="true" />
            Remove deployer's ownership
          </button>
        </>
      )
    },
    fundingRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding required',
      actions: (
        <>
          <button className="secondary" onClick={() => {}}>
            Fund contract
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    fundingInProgress: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding in progress',
      actions: (
        <>
          <button className="primary" disabled>
            Funding contract pending
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    approved: {
      icon: <SuccessIcon className="w-4 h-4" />,
      label: 'Approved'
    },
    declined: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Declined'
    },
    success: {
      icon: <SuccessIcon className="w-4 h-4" />,
      label: 'Success'
    }
  };

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      setSafeTransaction({ ...safeTx });
    }
  };

  // useEffect(() => {
  //   if (transaction?.hash) {
  //     fetchSafeTransactionFromHash(transaction.hash);
  //   }
  // }, [transaction, account]);

  return (
    <div className={`panel ${className} mb-5`}>
      <div className="row-center justify-between border-b border-gray-200 mb-3 pb-3">
        {insufficientBalance ? (
          <Chip
            label={
              <p className="row-center">
                {statuses.fundingRequired.icon}
                {statuses.fundingRequired.label}
              </p>
            }
            color={'warning'}
            rounded
          />
        ) : status ? (
          <Chip
            label={
              <p className="row-center">
                {statuses[status]?.icon}
                {statuses[status]?.label}
              </p>
            }
            color={status === 'approved' ? 'success' : status === 'declined' ? 'danger' : 'warning'}
            rounded
          />
        ) : null}
        {status === 'authRequired' || status === 'fundingInProgress' ? (
          <div className="row-center gap-1 paragraphy-small-medium text-neutral-500">
            <div>
              Confirmation status <span className="text-secondary-900">{safeTransaction?.signatures.size}</span>/
              {currentSafe?.owners.length}
            </div>
            <StepWizard
              status={safeTransaction?.signatures.size ?? 0}
              steps={new Array(currentSafe?.owners.length).fill({ title: '', desc: '' })}
              size="tiny"
            />
          </div>
        ) : null}
      </div>
      {/* <div>
        {type === 'contract' ? (
          <ContractOverview
            tokenName={mintFormState.name}
            tokenSymbol={mintFormState.symbol}
            supplyCap={mintFormState.supplyCap}
            maxSupply={mintFormState.initialSupply ? mintFormState.initialSupply : 0}
            address={mintFormState.address}
          />
        ) : null}
      </div> */}
      <div className="border-t mt-3 pt-3 row-center justify-between">
        <div className="row-center">{status ? statuses[status]?.actions : ''}</div>
      </div>
    </div>
  );
};

export default AddVestingSchedules;
