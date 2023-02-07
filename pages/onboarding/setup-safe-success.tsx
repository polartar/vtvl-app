import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Lottie from 'lottie-react';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import SuccessAnimation from 'public/successfully-done.json';
import { ReactElement } from 'react';

const ConfirmationSuccess: NextPageWithLayout = () => {
  return (
    <>
      <h1 className="h2 font-medium text-center mb-10 max-w-sm">Congratulations you've setup a Safe successfully</h1>
      <EmptyState
        image={<Lottie animationData={SuccessAnimation} style={{ width: '106px' }} />}
        imageSize="small"
        imageBlend={false}
        description={
          <>
            Now you can select to "<strong>Mint a new token</strong>" or "<strong>Import existing token</strong>".
          </>
        }>
        <button type="button" className="primary flex" onClick={() => Router.push(`/dashboard`)}>
          Continue
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
