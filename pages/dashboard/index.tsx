import Card from '@components/atoms/Card/Card';
import Chip from '@components/atoms/Chip/Chip';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import StepProgress from '@components/atoms/StepProgress/StepProgress';
import { Typography } from '@components/atoms/Typography/Typography';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
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
import { useModal } from 'hooks/useModal';
import { useRouter } from 'next/router';
import ImportIcon from 'public/icons/import-icon.svg';
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
            <div className="flex flex-col items-start gap-4 lg:flex-row">
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
