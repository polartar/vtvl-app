import EmptyState from '@components/atoms/EmptyState/EmptyState';
import ActivityFeed from '@components/molecules/ActivityFeed/ActivityFeed';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import DashboardInfoCard from '@components/organisms/DashboardInfoCard/DashboardInfoCard';
import DashboardSchedule from '@components/organisms/DashboardSchedule/DashboardSchedule';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useState } from 'react';

import { NextPageWithLayout } from './_app';

const Dashboard: NextPageWithLayout = () => {
  const [hasProject, setHasProject] = useState(true);
  const router = useRouter();
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

  console.log(activities);
  return (
    <>
      {!hasProject ? (
        <>
          <h1 className="h2 font-medium text-center mb-10">My Projects</h1>
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No projects found"
            description={
              <>
                Your projects live here. Start a project by clicking on <br />"<strong>Mint a new token</strong>" or "
                <strong>Import existing tokent</strong>".
              </>
            }>
            <button
              type="button"
              className="primary flex flex-row gap-2 items-center"
              onClick={() => router.push('/minting-token')}>
              <PlusIcon className="w-5 h-5" />
              Mint new token
            </button>
            <button type="button" className="line">
              Import existing token
            </button>
          </EmptyState>
        </>
      ) : (
        <div className="w-full">
          <p className="text-neutral-500 text-sm font-medium mb-2">Overview</p>
          {/* Token details section and CTAs */}
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
            <div>
              <TokenProfile name="BICONOMY" logo="/images/biconomy-logo.png" className="mb-2" />
              <p className="text-sm font-medium text-netural-900">
                Token address: <span className="text-neutral-500">0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5</span>
              </p>
            </div>
            <div className="flex flex-row items-center justify-start gap-2">
              <button className="primary row-center">
                <PlusIcon className="w-5 h-5" />
                <span className="whitespace-nowrap">Create Schedule</span>
              </button>
              <button className="secondary row-center">
                <PlusIcon className="w-5 h-5" />
                <span className="whitespace-nowrap">Mint Supply</span>
              </button>
            </div>
          </div>
          <div className="panel mb-6">
            <DashboardSchedule
              name="Voyager-0123"
              beneficiaries={4}
              startDate="October 22, 2022"
              endDate="July 2, 2023"
              cliff="1 month"
              linearRelease="Monthly"
              totalAllocated="75,000 BICO"
              status="approvalNeeded"
              detailUrl="/vesting-schedule"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <ActivityFeed activities={activities} />
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
