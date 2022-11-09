import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useDashboardContext } from '@providers/dashboard.context';
import { useWeb3React } from '@web3-react/core';
import Chip from 'components/atoms/Chip/Chip';
import StepWizard from 'components/atoms/StepWizard/StepWizard';
import ContractOverview from 'components/molecules/ContractOverview/ContractOverview';
import ScheduleOverview from 'components/molecules/ScheduleOverview/ScheduleOverview';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import { useTokenContext } from 'providers/token.context';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import { useEffect, useMemo, useState } from 'react';
import { fetchOrgByQuery } from 'services/db/organization';
import { createTransaction, fetchTransaction, updateTransaction } from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { createVestingContract, fetchVestingContract, fetchVestingContractByQuery } from 'services/db/vestingContract';
import { DATE_FREQ_TO_TIMESTAMP } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';
import { IScheduleOverviewProps, IVesting, IVestingContractProps } from 'types/models/vesting';
import { parseTokenAmount } from 'utils/token';
import { getCliffAmount, getCliffDateTime, getNumberOfReleases, getProjectedEndDateTime } from 'utils/vesting';

interface IFundContractStatuses {
  icon: string | JSX.Element | React.ReactNode;
  label: string;
  actions?: JSX.Element | React.ReactNode;
}

const FundContract = () => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip

  const { account, library, activate, chainId } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const {
    vestings,
    transactions,
    vestingContract,
    ownershipTransfered,
    fetchDashboardVestingContract,
    fetchDashboardVestings,
    fetchDashboardTransactions,
    setOwnershipTransfered,
    depositAmount,
    insufficientBalance
  } = useDashboardContext();

  const [activeVestingIndex, setActiveVestingIndex] = useState(0);
  const [status, setStatus] = useState('fundingRequired');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [transaction, setTransaction] = useState<ITransaction | undefined>();
  const [approved, setApproved] = useState(false);
  const [executable, setExecutable] = useState(false);

  const handleCreateSignTransaction = () => {};
  const handleExecuteTransaction = () => {};
  const handleApproveTransaction = () => {};
  const handleDeployVestingContract = () => {};
  const handleTransferOwnership = () => {};

  const statuses: Record<string, IFundContractStatuses> = {
    createSignTransaction: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Authorization required',
      actions: (
        <>
          <button
            disabled={approved || !vestingContract?.id || !ownershipTransfered}
            className="secondary"
            onClick={handleCreateSignTransaction}>
            {approved ? 'Approved' : 'Create and Sign the transaction'}
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    authRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Authorization required',
      actions: (
        <>
          <button
            disabled={(approved && !executable) || insufficientBalance}
            className="secondary"
            onClick={executable ? handleExecuteTransaction : handleApproveTransaction}>
            {executable ? 'Execute' : 'Sign and authorize'}
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    vestingContractRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Vesting contract required',
      actions: (
        <>
          <button className="secondary" onClick={handleDeployVestingContract}>
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

  const steps = [
    { title: '', desc: '' },
    { title: '', desc: '' },
    { title: '', desc: '' }
  ];

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (safe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      console.log({ apiTx });
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      setSafeTransaction({ ...safeTx });
    }
  };

  useEffect(() => {
    if (account && safeTransaction && safe) {
      setApproved(safeTransaction.signatures.has(account.toLowerCase()));
      if (safeTransaction.signatures.size === safe?.owners.length) {
        setExecutable(true);
      }
      setStatus('authRequired');
    }
  }, [safeTransaction, account, safe]);

  return insufficientBalance ? (
    <div className={`panel mb-5`}>
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
                {statuses[status].icon}
                {statuses[status].label}
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
              {safe?.owners.length}
            </div>
            <StepWizard
              status={safeTransaction?.signatures.size ?? 0}
              steps={new Array(safe?.owners.length).fill({ title: '', desc: '' })}
              size="tiny"
            />
          </div>
        ) : null}
      </div>
      <div>
        <div className="flex gap-3">
          <div>
            <label>
              <span>Contract Address</span>
            </label>
            <p className="paragraphy-tiny-medium neutral-text">{vestingContract?.data?.address}</p>
          </div>
          <div>
            <label>
              <span>Amount needed</span>
            </label>
            <p className="paragraphy-tiny-medium neutral-text">{depositAmount}</p>
          </div>
        </div>
      </div>
      <div className="border-t mt-3 pt-3 row-center justify-between">
        <div className="row-center">{status ? statuses[status].actions : ''}</div>
      </div>
    </div>
  ) : null;
};

export default FundContract;
