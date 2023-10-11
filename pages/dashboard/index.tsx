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
import { useVestingContext } from '@providers/vesting.context';
import { useAuth } from '@store/useAuth';
import { useModal } from 'hooks/useModal';
import { useRouter } from 'next/router';
import ImportIcon from 'public/icons/import-icon.svg';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useCallback, useEffect, useMemo } from 'react';

import { NextPageWithLayout } from '../_app';

const Dashboard: NextPageWithLayout = () => {
  const { userId } = useAuth();
  const { organizationId, emailSignUp } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { fetchDashboardData } = useDashboardContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { pendingTransactions } = useTransactionLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});
  const { setShowVestingSelectModal } = useVestingContext();

  const router = useRouter();

  useEffect(() => {
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email')?.replace(' ', '+');
    if (email) loginFromURL(email);
    fetchDashboardData();
  }, []);

  const isMintAvailabe = useMemo(() => {
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
              disabled={!isMintAvailabe}
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
            <div className="flex flex-row items-center justify-start gap-2">
              <div className="group relative">
                <button className="primary row-center" onClick={() => setShowVestingSelectModal(true)}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Create</span>
                </button>
              </div>
              {mintFormState.address && !mintFormState.isImported && mintFormState.supplyCap === 'UNLIMITED' && (
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
