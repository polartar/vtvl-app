import Copy from '@components/atoms/Copy/Copy';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import ActivityFeed from '@components/molecules/ActivityFeed/ActivityFeed';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import CreateVestingContractModal from '@components/organisms/CreateVestingContractModal';
import DashboardInfoCard from '@components/organisms/DashboardInfoCard/DashboardInfoCard';
import AddVestingSchedules from '@components/organisms/DashboardPanel/AddVestingSchedules';
import DashboardPendingActions from '@components/organisms/DashboardPendingActions';
import DashboardVestingSummary from '@components/organisms/DashboardVestingSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import CreateVestingContract from 'components/organisms/DashboardPanel/CreateVestingContract';
import { useModal } from 'hooks/useModal';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useCallback, useEffect } from 'react';

import { NextPageWithLayout } from '../_app';

const Dashboard: NextPageWithLayout = () => {
  const { library, account, activate } = useWeb3React();
  const { organizationId, safe, emailSignUp, user } = useAuthContext();
  const { mintFormState, isTokenLoading } = useTokenContext();
  const { scheduleFormState } = useVestingContext();
  const { fetchDashboardData } = useDashboardContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { pendingTransactions } = useTransactionLoaderContext();
  const { ModalWrapper, open, showModal, hideModal } = useModal({});

  const router = useRouter();

  useEffect(() => {
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email');
    if (email) loginWithUrl(email);
    fetchDashboardData();
  }, []);

  const isMintAvailabe = useCallback(() => {
    const mintingTransaction = pendingTransactions.find((transaction) => transaction.data.type === 'TOKEN_DEPLOYMENT');
    return !mintingTransaction;
  }, [pendingTransactions]);

  const loginWithUrl = async (email: string) => {
    try {
      await emailSignUp({ email }, window.location.toString());
    } catch (error: any) {
      console.log('error ', error);
    }
  };

  const activities = [
    {
      icon: 'success',
      text: 'Gnosis Safe integrated successfully',
      date: new Date(2022, 9, 21, 10, 30)
    },
    {
      icon: 'warning',
      text: '3 vesting schedule needs approval',
      date: new Date(2022, 9, 14, 9, 22)
    },
    {
      icon: 'warning',
      text: 'Vesting contract not yet created',
      date: new Date(2022, 9, 12, 21, 16)
    },
    {
      icon: 'success',
      text: 'Beneficiaries added',
      date: new Date(2022, 8, 28, 11, 32)
    }
  ];

  useEffect(() => {
    // console.log('user obj in auth context', user);
    console.log('retesting org_id', organizationId);

    if (!organizationId) {
      // if (!user?.memberInfo?.org_id) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [organizationId]);

  return (
    <>
      {!mintFormState.address || mintFormState.status === 'PENDING' || mintFormState.status === 'FAILED' ? (
        <>
          <h1 className="h2 font-medium text-center mb-10">My Projects</h1>
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No projects found"
            description={<>Create a project by selecting an option below</>}>
            <button type="button" className="line" onClick={() => router.push('/dashboard/import-token')}>
              Import existing token
            </button>
            <button
              type="button"
              className="primary flex flex-row gap-2 items-center"
              disabled={!isMintAvailabe()}
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
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8 px-8">
            <div>
              <TokenProfile
                name={mintFormState.name}
                symbol={mintFormState.symbol}
                logo={mintFormState.logo}
                address={mintFormState.address}
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
                <div className="hidden group-hover:block pt-4 absolute bottom-0 left-0 min-w-[200px] transform translate-y-full">
                  <div className="bg-white border border-gray-100 py-2 rounded-2xl">
                    <div
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary-50"
                      onClick={showModal}>
                      <img src="/icons/create-vesting-contract.svg" />
                      Create contract
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary-50"
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

          <div className="px-8 py-4">
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
