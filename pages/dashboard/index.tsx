import EmptyState from '@components/atoms/EmptyState/EmptyState';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import CreateVestingContractModal from '@components/organisms/CreateVestingContractModal';
import DashboardPendingActions from '@components/organisms/DashboardPendingActions';
import DashboardVestingSummary from '@components/organisms/DashboardVestingSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import getUnixTime from 'date-fns/getUnixTime';
import { Timestamp } from 'firebase/firestore';
import { useModal } from 'hooks/useModal';
import { useRouter } from 'next/router';
import ImportIcon from 'public/icons/import-icon.svg';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { fetchAllOrganizations, fetchOrg } from 'services/db/organization';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { fetchAllVestings, fetchVestingsByQuery } from 'services/db/vesting';
import { fetchAllVestingContracts, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { IRecipientDoc } from 'types/models';
import { getVestingDetailsFromContracts } from 'utils/multicall';
import { getCliffDateTime, getNextUnlock } from 'utils/vesting';

import { NextPageWithLayout } from '../_app';

interface IRecipient {
  company?: string;
  name?: string;
  type?: string;
  email?: string;
  wallet?: string;
  unlockDate?: string;
  cliff?: string;
  endDate?: string;
  releaseType?: string;
  lockedAmount?: string;
  vestedAmount?: string;
  claimedAmount?: string;
  totalAllocation?: string;
}

const Dashboard: NextPageWithLayout = () => {
  const { organizationId, emailSignUp } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { fetchDashboardData } = useDashboardContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { pendingTransactions } = useTransactionLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

  const router = useRouter();

  useEffect(() => {
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email')?.replace(' ', '+');
    if (email) loginFromURL(email);
    fetchDashboardData();
  }, []);

  const isMintAvailable = useMemo(() => {
    const mintingTransaction = pendingTransactions.find((transaction) => transaction.data.type === 'TOKEN_DEPLOYMENT');
    return !mintingTransaction;
  }, [pendingTransactions]);

  const loginFromURL = useCallback(async (email: string) => {
    try {
      await emailSignUp({ email }, window.location.toString());
    } catch (error) {
      console.error('Login with URL error: ', error);
    }
  }, []);

  useEffect(() => {
    if (!organizationId) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [organizationId]);

  const [isFetching, setIsFetching] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<IRecipient[]>([]);
  const [isRecipientFetching, setIsRecipientFetching] = useState(false);
  const csvLink = useRef<HTMLAnchorElement>(null);
  const csvRecipientLink = useRef<HTMLAnchorElement>(null);

  const extractOrganizations = async () => {
    if (isFetching) return;
    setIsFetching(true);
    const organizations = await fetchAllOrganizations();
    const vestingContracts = await fetchAllVestingContracts();
    const actualContracts = vestingContracts.filter((contract) => !!contract.address);
    const actualOrganizationIds = actualContracts.map((contract) => contract.organizationId);
    const actualOrganizations: any[] = organizations.filter((org) => actualOrganizationIds.includes(org.id));
    // const vestings = await fetchVestingsByQuery(['status'], ['=='], ['LIVE']);
    // console.log({ vestings });

    setOrganizations(actualOrganizations);

    setIsFetching(false);
  };

  const extractRecipients = async () => {
    if (isRecipientFetching) return;
    setIsRecipientFetching(true);
    const result: IRecipient[] = [];
    const recipients = await fetchRecipientsByQuery(['chainId'], ['=='], [1]);

    const vestings = await fetchVestingsByQuery(['status', 'chainId'], ['==', '=='], ['LIVE', 1]);
    const vestingContracts = await fetchVestingContractsByQuery(['chainId'], ['=='], [1]);

    await Promise.all(
      recipients.slice(5).map(async (recipient: IRecipientDoc) => {
        const recipientInfo: IRecipient = {};
        if (recipient.data.organizationId === 'REcJODJXmcoRQ3FVMNeF') {
          recipientInfo.company = 'KAP Games';
        } else recipientInfo.company = recipient.data.company;
        recipientInfo.name = recipient.data.name;
        recipientInfo.type = recipient.data.recipientType;
        recipientInfo.email = recipient.data.email;
        recipientInfo.wallet = recipient.data.walletAddress;

        const vesting = vestings.find((v) => v.id === recipient.data.vestingId);
        const vestingContract = vestingContracts.find((c) => c.id === vesting?.data.vestingContractId);
        if (vesting && vestingContract) {
          const vestingInfo = await getVestingDetailsFromContracts(1, [vestingContract], recipient.data.walletAddress);

          const { startDateTime, endDateTime, releaseFrequency, cliffDuration } = vesting.data.details;
          const computeCliffDateTime = getCliffDateTime(
            new Date((startDateTime! as unknown as Timestamp).seconds * 1000),
            cliffDuration
          );

          const unlockDate =
            Date.now() +
            (vesting.data.details.releaseFrequency !== 'continuous' && endDateTime
              ? getNextUnlock(endDateTime, releaseFrequency, computeCliffDateTime)
              : 60) *
              1000;
          recipientInfo.cliff = vestingInfo[0].cliffAmount;
          recipientInfo.unlockDate = new Date(unlockDate).toUTCString();
          recipientInfo.endDate = new Date(
            (vesting.data.details.endDateTime as unknown as Timestamp).seconds * 1000
          ).toUTCString();
          recipientInfo.releaseType = vesting.data.details.releaseFrequency;
          recipientInfo.lockedAmount = vestingInfo[0].locked;
          recipientInfo.vestedAmount = (+vestingInfo[0].unclaimed + +vestingInfo[0].withdrawn).toString();
          recipientInfo.claimedAmount = vestingInfo[0].withdrawn;
          recipientInfo.totalAllocation = vestingInfo[0].allocations;

          result.push(recipientInfo);
        }
        return recipient;
      })
    );
    setRecipients(result);

    setIsRecipientFetching(false);
  };

  useEffect(() => {
    if (organizations && organizations.length > 0) {
      if (csvLink.current) {
        (csvLink.current as any).link.click();
      }
    }
  }, [organizations]);

  useEffect(() => {
    if (recipients && recipients.length > 0) {
      if (csvRecipientLink.current) {
        (csvRecipientLink.current as any).link.click();
      }
    }
  }, [recipients]);
  return (
    <>
      {!mintFormState.address || mintFormState.status === 'PENDING' || mintFormState.status === 'FAILED' ? (
        <>
          <h1 className="h2 font-medium text-center mb-10">My Projects</h1>
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No projects found"
            description={<>Create a project by selecting an option below</>}>
            <button
              type="button"
              className="primary flex flex-row gap-2 items-center"
              onClick={() => router.push('/dashboard/import-token')}>
              <ImportIcon className="w-5 h-5" />
              Import existing token
            </button>
            <button
              type="button"
              className="line flex flex-row gap-2 items-center"
              disabled={!isMintAvailable}
              onClick={() => router.push('/minting-token')}>
              <PlusIcon className="w-5 h-5" />
              Mint a new token
            </button>
          </EmptyState>
        </>
      ) : (
        <div className="w-full">
          <p className="text-neutral-500 text-sm font-medium mb-2 ml-8">Overview</p>
          {/* Token details section and CTAs */}
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8 px-6">
            <div>
              <TokenProfile
                name={mintFormState.name}
                symbol={mintFormState.symbol}
                logo={mintFormState.logo}
                address={mintFormState.address}
                burnable={mintFormState.burnable}
              />

              {/* {vestingContract && vestingContract.data?.address && (
                <div className="text-sm font-medium text-netural-900">
                  Vesting Contract Address:{' '}
                  <span className="text-neutral-500">
                    <Copy text={vestingContract.data?.address}>{vestingContract.data?.address}</Copy>
                  </span>
                </div>
              )} */}
            </div>
            <button className="primary row-center" onClick={() => extractOrganizations()}>
              <span className="whitespace-nowrap">{isFetching ? 'Loading' : 'Extract organizations'}</span>
            </button>
            <CSVLink
              data={organizations}
              filename="transactions.csv"
              className="hidden"
              ref={csvLink as any}
              target="_blank"
            />
            <button className="primary row-center" onClick={() => extractRecipients()}>
              <span className="whitespace-nowrap">{isRecipientFetching ? 'Loading' : 'Extract Vestings'}</span>
            </button>
            <CSVLink
              data={recipients}
              filename="recipients.csv"
              className="hidden"
              ref={csvRecipientLink as any}
              target="_blank"
            />
            <div className="flex flex-row items-center justify-start gap-2">
              <div className="group relative">
                <button
                  className="primary row-center"
                  onClick={() => {
                    // router.push('/vesting-schedule/add-recipients');
                  }}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Create</span>
                </button>
                <div className="hidden group-hover:block pt-3 absolute bottom-0 right-0 min-w-[200px] transform translate-y-full">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-lg">
                    <div
                      className="flex items-center gap-2 px-3 pb-2 pt-3 rounded-t-2xl cursor-pointer hover:bg-primary-50 transition-all"
                      onClick={showModal}>
                      <img src="/icons/create-vesting-contract.svg" />
                      Create contract
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 pb-3 pt-2 rounded-b-2xl cursor-pointer hover:bg-primary-50 transition-all"
                      onClick={() => router.push('/vesting-schedule/add-recipients')}>
                      <img src="/icons/create-vesting-schedule.svg" />
                      Create schedule
                    </div>
                  </div>
                </div>
              </div>
              {mintFormState.address && !mintFormState.imported && mintFormState.supplyCap === 'UNLIMITED' && (
                <button className="secondary row-center" onClick={() => router.push('/dashboard/mint-supply')}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Mint Supply</span>
                </button>
              )}
            </div>
          </div>

          <DashboardVestingSummary />

          <div className="px-6 py-3">
            <DashboardPendingActions />
          </div>
          <ModalWrapper>
            <CreateVestingContractModal hideModal={hideModal} />
          </ModalWrapper>
        </div>
      )}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
Dashboard.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'Dashboard', route: '/dashboard' }];
  return (
    <SteppedLayout title="Dashboard" crumbs={crumbSteps} padded={false}>
      {page}
    </SteppedLayout>
  );
};

export default Dashboard;
