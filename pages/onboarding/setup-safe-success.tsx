import EmptyState from '@components/atoms/EmptyState/EmptyState';
import { Typography } from '@components/atoms/Typography/Typography';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Lottie from 'lottie-react';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import SuccessAnimation from 'public/successfully-done.json';
import { ReactElement } from 'react';

const ConfirmationSuccess: NextPageWithLayout = () => {
  return (
    <>
      <Typography size="subtitle" variant="sora" className="font-medium text-neutral-900 text-center mb-10 max-w-sm">
        Congratulations you've setup a Safe successfully
      </Typography>
      <EmptyState
        image={<Lottie animationData={SuccessAnimation} style={{ width: '106px' }} />}
        imageSize="small"
        imageBlend={false}>
        <button type="button" className="primary flex" onClick={() => Router.push(`/dashboard`)}>
          Go to dashboard
        </button>
      </EmptyState>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ConfirmationSuccess.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'Get started', route: '/dashboard' }];

  return (
    <SteppedLayout title="Configure schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ConfirmationSuccess;
