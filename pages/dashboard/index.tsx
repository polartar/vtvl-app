import Copy from '@components/atoms/Copy/Copy';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import ActivityFeed from '@components/molecules/ActivityFeed/ActivityFeed';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import DashboardInfoCard from '@components/organisms/DashboardInfoCard/DashboardInfoCard';
import AddVestingSchedules from '@components/organisms/DashboardPanel/AddVestingSchedules';
import DashboardVestingSummary from '@components/organisms/DashboardVestingSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import CreateVestingContract from 'components/organisms/DashboardPanel/CreateVestingContract';
import FundContract from 'components/organisms/DashboardPanel/FundContract';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useEffect, useState } from 'react';

import { NextPageWithLayout } from '../_app';

const Dashboard: NextPageWithLayout = () => {
  const { library, account, activate } = useWeb3React();
  const { organizationId, safe, emailSignUp, user } = useAuthContext();
  const { mintFormState, isTokenLoading } = useTokenContext();
  const { scheduleFormState } = useVestingContext();
  const {
    vestings,
    vestingContract,
    transactions,
    ownershipTransfered,
    removeOwnership,
    insufficientBalance,
    depositAmount,
    vestingContractLoading,
    vestingsLoading,
    transactionsLoading,
    fetchDashboardData,
    recipients
  } = useDashboardContext();
  const { showLoading, hideLoading } = useLoaderContext();

  const router = useRouter();

  useEffect(() => {
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email');
    if (email) loginWithUrl(email);
    fetchDashboardData();
  }, []);

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
            <button
              type="button"
              className="primary flex flex-row gap-2 items-center"
              onClick={() => router.push('/minting-token')}>
              <PlusIcon className="w-5 h-5" />
              Mint a new token
            </button>
            <button type="button" className="line" onClick={() => router.push('/dashboard/import-token')}>
              Import existing token
            </button>
          </EmptyState>
        </>
      ) : (
        <div className="w-full">
          <p className="text-neutral-500 text-sm font-medium mb-2 ml-8">Overview</p>
          {/* Token details section and CTAs */}
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8 ml-8">
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
              <button
                className="primary row-center"
                onClick={() => {
                  router.push('/vesting-schedule/add-recipients');
                }}>
                <PlusIcon className="w-5 h-5" />
                <span className="whitespace-nowrap">Create Schedule</span>
              </button>
              {mintFormState.address && !mintFormState.imported && mintFormState.supplyCap === 'UNLIMITED' && (
                <button className="secondary row-center" onClick={() => router.push('/dashboard/mint-supply')}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Mint Supply</span>
                </button>
              )}
            </div>
          </div>
          <DashboardVestingSummary />

          {/* {vestings
            ? vestings.map((vesting) => (
                <div className="panel mb-6">
                  <DashboardPanel type="schedule" vestings={vestings} />
                </div>
              ))
            : !hasVestingContract && <DashboardPanel type="contract" />} */}
          <div className="px-8 mt-8">
            {(!vestingContract?.id || !ownershipTransfered || removeOwnership) && (
              <CreateVestingContract type="contract" />
            )}
            <FundContract />
            {vestings && vestings.length > 0 && <AddVestingSchedules type="schedule" />}
          </div>

          {/* <DashboardPanel
            type="schedule"
            schedule={sampleScheduleDetails}
            status="authRequired"
            step={1}
            className="mb-6"
            pagination={{ total: 5, page: currentPage, onNext: showNextSchedule, onPrevious: showPreviousSchedule }}
          />
          <DashboardPanel
            type="contract"
            contract={sampleContractDetails}
            status="vestingContractRequired"
            className="mb-6"
          />
          <DashboardPanel
            type="contract"
            contract={sampleContractDetails}
            status="transferToMultisigSafe"
            className="mb-6"
          />
          <DashboardPanel type="contract" contract={sampleContractDetails} status="fundingRequired" className="mb-6" />
          <DashboardPanel
            type="schedule"
            schedule={sampleScheduleDetails}
            status="fundingInProgress"
            step={2}
            className="mb-6"
          /> */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            <DashboardInfoCard
              icon="/icons/calendar.svg"
              title="Vesting overview"
              description="Lorem ipsum dolor sit amet, consectetur elit. Smperdiet eleifend est, in ultricies massa elit faucibus in."
              emptyTitle="No vesting found"
              emptyImage="/images/chart-projection.svg"
              emptyDescription="Vesting will be displayed here once ready."
              url="/vesting-schedule"
            />
            <DashboardInfoCard
              icon="/icons/pie-chart.svg"
              title="Tokenomics"
              description="Lorem ipsum dolor sit amet, consectetur elit. Smperdiet eleifend est, in ultricies massa elit faucibus in."
              emptyTitle="No tokenomics found"
              emptyImage="/images/chart-projection.svg"
              emptyDescription="Tokenomics will be displayed here once ready."
              url="/tokenomics"
            />

            <div className="panel">
              <h3 className="h5 text-neutral-900 inter font-semibold mb-4">Activity</h3>
              <p className="text-neutral-400">Coming soon</p>
              {/* <ActivityFeed activities={activities} /> */}
            </div>
          </div>
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
    <SteppedLayout title="Dashboard" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default Dashboard;
