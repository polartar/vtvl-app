import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';

const ConfirmationSuccess: NextPageWithLayout = () => {
  return (
    <>
      <h1 className="h2 font-medium text-center mb-10">Confirmation</h1>
      <EmptyState
        image="/images/success-animation.gif"
        imageSize="small"
        imageBlend={false}
        title="Vesting schedule succesfully created!"
        description="A notification has been sent to the founder for approval">
        <button type="button" className="primary flex" onClick={() => Router.push(`/vesting-schedule`)}>
          View schedules
        </button>
        <button type="button" className="primary line" onClick={() => Router.push(`/dashboard`)}>
          Go to dashboard
        </button>
      </EmptyState>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ConfirmationSuccess.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/configure' }
  ];

  return (
    <SteppedLayout title="Configure schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ConfirmationSuccess;