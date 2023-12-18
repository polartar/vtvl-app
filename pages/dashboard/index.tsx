import ButtonGroup from '@components/atoms/ButtonGroup/ButtonGroup';
import Card from '@components/atoms/Card/Card';
import Chip from '@components/atoms/Chip/Chip';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import StepProgress from '@components/atoms/StepProgress/StepProgress';
import TickContent from '@components/atoms/TickContent/TickContent';
import { Typography } from '@components/atoms/Typography/Typography';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import AllocationSummaryChart from '@components/organisms/Cards/AllocationSummaryChart';
import BarLineChart from '@components/organisms/Charts/BarLineChart';
import CreateVestingContractModal from '@components/organisms/CreateVestingContractModal';
import DashboardActionButtons from '@components/organisms/Dashboard/ActionButtons';
import DashboardTokenDetails from '@components/organisms/Dashboard/TokenDetails';
import DashboardTransactionHistory from '@components/organisms/Dashboard/TransactionHistory';
import DashboardPendingActions from '@components/organisms/DashboardPendingActions';
import DashboardMyTask from '@components/organisms/DashboardPendingActions/MyTask';
import DashboardVestingSummary from '@components/organisms/DashboardVestingSummary';
import DashboardSection from '@components/organisms/Layout/DashboardSection';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useAuth } from '@store/useAuth';
import { formatNumber } from '@utils/token';
import { useModal } from 'hooks/useModal';
import { useRouter } from 'next/router';
import DownloadIcon from 'public/icons/downloading-data.svg';
import ImportIcon from 'public/icons/import-icon.svg';
import NotifIcon from 'public/icons/notification-icon.svg';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { NextPageWithLayout } from '../_app';

const Dashboard: NextPageWithLayout = () => {
  const { userId } = useAuth();
  const { organizationId, emailSignUp } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { fetchDashboardData } = useDashboardContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { pendingTransactions } = useTransactionLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

  const [isEmpty, setIsEmpty] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email')?.replace(' ', '+');
    if (email) loginFromURL(email);
    fetchDashboardData();
  }, []);

  const isMintAvailable = useMemo(() => {
    const mintingTransaction = pendingTransactions.find((transaction) => transaction.type === 'TOKEN_DEPLOYMENT');
    return !mintingTransaction;
  }, [pendingTransactions]);

  const loginFromURL = useCallback(async (email: string) => {
    try {
      await emailSignUp({ email }, window.location.toString());
    } catch (error) {
      console.error('Login with URL error: ', error);
    }
  }, []);

  const myTaskFilters = [
    { label: 'All', value: 'all' },
    { label: 'Time-based', value: 'time-based', counter: 2 },
    { label: 'Milestone-based', value: 'milestone-based', counter: 3 }
  ];

  const txHistoryFilters = [
    { label: 'All', value: 'all' },
    { label: 'Withdrawn', value: 'withdrawn' },
    { label: 'Revoked', value: 'revoked' },
    { label: 'Transfer', value: 'transfer' }
  ];

  const graphViewFilters = [
    { label: '1M', value: '1-month' },
    { label: '3M', value: '3-month' },
    { label: '6M', value: '6-months' },
    { label: '1Y', value: '1-year' }
  ];

  // PIE CHART DEMO DATA
  const pieChartData = [
    {
      name: 'CEX',
      value: 30000
    },
    {
      name: 'DEX',
      value: 40000
    },
    {
      name: 'Safe',
      value: 20000
    },
    {
      name: 'Cold wallet',
      value: 10000
    }
  ];

  // BAR LINE CHART DEMO DATA
  const barLineChartData = [
    {
      name: 'Jan',
      lineValue: 100,
      barValue: 25
    },
    { name: 'Feb', lineValue: 103, barValue: 50 },
    { name: 'Mar', lineValue: 103, barValue: 40 },
    { name: 'Apr', lineValue: 99, barValue: 45 },
    { name: 'May', lineValue: 95, barValue: 74 },
    { name: 'Jun', lineValue: 98, barValue: 63 },
    { name: 'Jul', lineValue: 100, barValue: 54 },
    { name: 'Aug', lineValue: 102, barValue: 58 },
    { name: 'Sep', lineValue: 105, barValue: 82 },
    { name: 'Oct', lineValue: 110, barValue: 52 },
    { name: 'Nov', lineValue: 103, barValue: 55 },
    { name: 'Dec', lineValue: 102, barValue: 53 }
  ];

  // Button Group
  const handleSetAlerts = () => {
    console.log('Set Alerts clicked!');
    alert('Set Alerts clicked!');
  };

  const handleExport = () => {
    console.log('Export clicked!');
    alert('Export clicked!');
  };
  const buttonGroup = [
    { label: 'Set alerts', icon: <NotifIcon />, onClick: handleSetAlerts },
    { label: 'Export', icon: <DownloadIcon />, onClick: handleExport }
  ];

  const handleMyTaskFilterChange = (value: string) => {
    // Update filters here when the filter changes
    console.log('My Task Filter changed!', value);
  };

  const handleTxHistoryFilterChange = (value: string) => {
    // Update filters here when the filter changes
    console.log('Transaction History Filter changed!', value);
  };

  useEffect(() => {
    if (!organizationId) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [organizationId]);

  return (
    <>
      {!mintFormState?.address || mintFormState?.status === 'PENDING' || mintFormState?.status === 'FAILED' ? (
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
        <div className="w-full px-6 pb-6">
          <p className="text-neutral-500 text-sm font-medium mb-2">Overview</p>
          {/* Token details section and CTAs */}
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
            <div className="flex flex-col items-start gap-4 lg:flex-row w-full">
              <TokenProfile
                name={mintFormState.name}
                symbol={mintFormState.symbol}
                logo={mintFormState.logo}
                address={mintFormState.address}
                burnable={mintFormState.burnable}
                layout="compact"
                className="flex-grow flex-shrink-0"
              />
              <DashboardTokenDetails />
            </div>
          </div>

          <div className="p-3 border border-neutral-300 rounded-xl mb-5">
            <div className="flex flex-row items-center justify-between gap-3 mb-8">
              <BarRadio variant="tab-small" options={graphViewFilters} />
              <ButtonGroup buttons={buttonGroup} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Typography variant="sora" size="base" className="font-semibold text-neutral-900">
                    Chart
                  </Typography>
                  {!isEmpty && (
                    <div className="flex items-center gap-5">
                      <TickContent
                        title="MC"
                        info="MC is Lorem Ipsum dolor sit amet."
                        status="increase"
                        changeText="7%"
                        value="$139,711,359"
                      />
                      <TickContent
                        title="FDV"
                        info="FDV is Lorem Ipsum dolor sit amet."
                        status="decrease"
                        changeText="2%"
                        value="$230,713,649"
                      />
                    </div>
                  )}
                </div>
                {isEmpty ? (
                  <div className="flex items-center p-6 mx-auto max-w-md mt-6">
                    <EmptyState
                      image="/images/chart-projection.svg"
                      imageSize="small"
                      imageBlend={false}
                      title="No records yet. 📈"
                      description={
                        <>
                          Uncover hidden insights and patterns here from highs to lows, your project will tell a story
                          here.
                        </>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-right my-3">
                      <div className="bg-neutral-400 text-neutral-50 rounded-lg inline-flex h-8 py-1.5 px-4 text-sm">
                        Claims vs Price Change
                      </div>
                    </div>
                    <div className="relative mx-auto hidden lg:flex">
                      <BarLineChart legends data={barLineChartData} />
                    </div>
                  </>
                )}
              </div>
              <div>
                <Typography variant="sora" size="base" className="font-semibold text-neutral-900">
                  Withdrawn summary
                </Typography>

                {isEmpty ? (
                  <div className="flex items-center p-6 mx-auto max-w-md mt-6">
                    <EmptyState
                      image="/images/chart-projection.svg"
                      imageSize="small"
                      imageBlend={false}
                      title="No records yet. 💰"
                      description={<>Review the past withdrawals and track the tokens that have move your project.</>}
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-323 h-323 relative mx-auto hidden lg:flex">
                      <AllocationSummaryChart
                        colors={['#fee2e2', '#b91c1c', '#ef4444', '#fca5a5']}
                        legends
                        data={pieChartData}
                      />
                      <div className="w-full flex flex-col gap-2 items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Typography size="title" className="font-semibold leading-none">
                          {formatNumber(100000)}
                        </Typography>
                        <Typography size="caption" className="font-medium leading-none text-neutral-500">
                          Total withdrawn
                        </Typography>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mt-8">
                      <Typography className="text-neutral-500">Month</Typography>
                      <Typography className="text-right">May 2023</Typography>
                      <Typography className="text-neutral-500">Price</Typography>
                      <Typography className="text-right">$0.412345 - $0.422431</Typography>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardSection
              title="My task"
              notifCount={6}
              filters={myTaskFilters}
              onFilterChange={handleMyTaskFilterChange}>
              {isEmpty ? (
                <div className="flex items-center p-6">
                  <EmptyState
                    image="/images/chart-projection.svg"
                    imageSize="small"
                    imageBlend={false}
                    title="No records yet. 🎯"
                    description={
                      <>
                        Keep track of your project missions here.
                        <br />
                        Approvals, funding, and executions - they're all be here.
                      </>
                    }
                  />
                </div>
              ) : (
                <DashboardMyTask />
              )}
            </DashboardSection>
            <DashboardSection
              title="Transaction history"
              filters={txHistoryFilters}
              onFilterChange={handleTxHistoryFilterChange}>
              {isEmpty ? (
                <div className="flex items-center p-6">
                  <EmptyState
                    image="/images/chart-projection.svg"
                    imageSize="small"
                    imageBlend={false}
                    title="No records yet. 📚"
                    description={<>Every transaction has a tale, and this is where they're told.</>}
                  />
                </div>
              ) : (
                <DashboardTransactionHistory />
              )}
            </DashboardSection>
          </div>
          <ModalWrapper>
            <CreateVestingContractModal hideModal={hideModal} />
          </ModalWrapper>
          <button className="primary large" onClick={() => setIsEmpty(!isEmpty)}>
            Toggle Empty State -- Remove me after integration
          </button>
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
    <SteppedLayout title="Dashboard" crumbs={crumbSteps} padded={false} actions={<DashboardActionButtons />}>
      {page}
    </SteppedLayout>
  );
};

export default Dashboard;
