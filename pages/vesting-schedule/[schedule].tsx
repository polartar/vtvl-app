import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Loader from '@components/atoms/Loader/Loader';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import ScheduleSummary from '@components/molecules/ScheduleSummary/ScheduleSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import WarningIcon from 'public/icons/warning.svg';
import { ReactElement, useEffect, useState } from 'react';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { fetchTransaction } from 'services/db/transaction';
import { fetchVesting } from 'services/db/vesting';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipientDoc, ITransaction, IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { getDuration } from 'utils/vesting';

const VestingScheduleDetailed: NextPageWithLayout = () => {
  const { account, library, chainId } = useWeb3React();
  const router = useRouter();
  const { schedule } = router.query;
  const [vestingSchedule, setVestingSchedule] = useState<IVesting | undefined>(undefined);
  const [recipients, setRecipients] = useState<IRecipientDoc[]>([]);
  const { mintFormState } = useTokenContext();
  const { safe, organizationId } = useAuthContext();
  const { loading, hideLoading, showLoading } = useLoaderContext();
  // const organizationId = 'MYvgDyXEY5kCfxdIvtY8'; // mock data

  const getVestingScheduleDetails = async () => {
    console.log('fetching schedule', schedule);
    // Get the schedule details
    try {
      const getVestingSchedule = await fetchVesting(schedule as string);
      const recipientsData = await fetchRecipientsByQuery(['vestingId'], ['=='], [schedule]);
      setRecipients(recipientsData);

      console.log('Vesting Schedule UI', getVestingSchedule);
      if (getVestingSchedule) {
        const actualDateTime = getActualDateTime(getVestingSchedule.details);
        setVestingSchedule({
          ...getVestingSchedule,
          details: {
            ...getVestingSchedule?.details,
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime
          }
        });
        hideLoading();
      }
    } catch (err) {
      // something went wrong
      hideLoading();
    }
  };

  useEffect(() => {
    if (schedule) {
      showLoading();
      getVestingScheduleDetails();
    }
  }, [schedule]);

  // Need to count and loop all approvers
  const wizardSteps = [
    {
      title: 'Vitalik Armstrong',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip label="Initiator" color="grayAlt" rounded />
        </div>
      )
    },
    {
      title: 'Pomp Aldrin',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip
            label={
              <p className="row-center">
                <WarningIcon className="w-4 h-4" />
                Approval needed
              </p>
            }
            color="warningAlt"
            rounded
          />
        </div>
      )
    },
    {
      title: 'Michael Glenn',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip
            label={
              <p className="row-center">
                <WarningIcon className="w-4 h-4" />
                Approval needed
              </p>
            }
            color="warningAlt"
            rounded
          />
        </div>
      )
    }
  ];

  const scheduleDuration =
    vestingSchedule && vestingSchedule.details.startDateTime && vestingSchedule.details.endDateTime
      ? getDuration(vestingSchedule.details.startDateTime as Date, vestingSchedule.details.endDateTime)
      : '';

  const approvers = new Array(safe?.threshold).fill({ title: '', desc: '' });
  const [transaction, setTransaction] = useState<{ id: string; data: ITransaction | undefined }>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  // Copy of the one from AddVestingSchedule.tsx
  // To do Arvin: Optimize this along with the existing one
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
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      setSafeTransaction({ ...safeTx });
    }
  };

  // Fetch the transaction by using the transaction id
  // With this, we can check whether the vesting schedule has multisig transactions
  useEffect(() => {
    if (vestingSchedule?.transactionId) {
      fetchTransaction(vestingSchedule.transactionId).then((res) => {
        setTransaction({ id: vestingSchedule.transactionId, data: res });
      });
    }
  }, [vestingSchedule]);

  // Actually fetch the Safe transaction
  useEffect(() => {
    if (transaction?.data?.hash) {
      fetchSafeTransactionFromHash(transaction.data.hash);
    }
  }, [transaction, account]);

  return (
    <>
      {!loading && vestingSchedule ? (
        <>
          <h1 className="h2 text-neutral-900 mb-10">{vestingSchedule.name}</h1>
          <div className="w-full mb-6 panel max-w-2xl">
            <h2 className="text-lg font-medium text-neutral-900 mb-1.5 text-center">Schedule Details</h2>
            {transaction && transaction.data?.status !== 'SUCCESS' && safeTransaction && safe ? (
              <>
                <p className="text-sm text-neutral-500 text-center mb-5">
                  <strong>{safeTransaction.signatures.size || 0}</strong> out of <strong>{safe?.threshold}</strong>{' '}
                  owners is required to confirm this schedule
                </p>
                <StepWizard
                  steps={approvers}
                  status={safeTransaction?.signatures.size ?? 0}
                  size="small"
                  className="mx-auto"
                  showAllLabels
                />
              </>
            ) : null}
            <div className="border-t border-gray-200 py-6 mt-6 grid sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Token per user</span>
                <p className="paragraphy-small-medium text-neutral-900">
                  {formatNumber(
                    new Decimal(vestingSchedule.details.amountToBeVested)
                      .div(new Decimal(recipients.length))
                      .toDP(6, Decimal.ROUND_UP)
                  )}{' '}
                  {mintFormState.symbol || 'Token'}
                </p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Total locked token</span>
                <p className="paragraphy-small-medium text-neutral-900">
                  {formatNumber(vestingSchedule.details.amountToBeVested)} {mintFormState.symbol || 'Token'}
                </p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Beneficiaries</span>
                <p className="paragraphy-small-medium text-neutral-900">{recipients.length}</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Total Period</span>
                <p className="paragraphy-small-medium text-neutral-900">{scheduleDuration}</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Created by</span>
                <p className="paragraphy-small-medium text-neutral-900">--</p>
              </div>
            </div>
            <ScheduleDetails {...vestingSchedule.details} token={mintFormState.symbol || 'Token'} />
            {/* {safeTransaction && account && safeTransaction.signatures.has(account.toLowerCase()) ? (
              <div className="row-center justify-center mt-6 pt-6 border-t border-gray-200">
                <Button className="secondary">Approve</Button>
                <Button className="primary">Reject</Button>
              </div>
            ) : null} */}
          </div>
        </>
      ) : null}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
VestingScheduleDetailed.getLayout = function getLayout(page: ReactElement) {
  const router = useRouter();
  const { schedule } = router.query;
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Transaction review', route: `/vesting-schedule/${schedule}` }
  ];
  return (
    <SteppedLayout title="Vesting schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default VestingScheduleDetailed;
