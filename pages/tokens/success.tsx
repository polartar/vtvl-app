import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import Lottie from 'lottie-react';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import SuccessAnimation from 'public/successfully-done.json';
import { ReactElement } from 'react';

const ClaimTokenComplete: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();
  return (
    <>
      <h1 className="h2 font-medium text-center mb-10">My Tokens</h1>
      <EmptyState
        image={<Lottie animationData={SuccessAnimation} style={{ width: '106px' }} />}
        imageSize="small"
        imageBlend={false}
        title="Claim complete"
        description={
          <>
            You have successfully withdrawn <strong>500</strong> {mintFormState.symbol || ''} tokens.
            <br />
            Your claimed tokens should appear in your wallet in a few minutes.
          </>
        }>
        <button type="button" className="primary flex" onClick={() => Router.push(`/tokens`)}>
          Claim portal
        </button>
        <button type="button" className="primary line" onClick={() => Router.push(`/dashboard`)}>
          Close
        </button>
      </EmptyState>
      <a href="https://etherscan.io/" target="_blank" className="text-xs text-neutral-500 underline">
        Check your transaction on Etherscan
      </a>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ClaimTokenComplete.getLayout = function getLayout(page: ReactElement) {
  const { mintFormState } = useTokenContext();
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'My tokens', route: '/tokens' },
    // Update the title of this into the actual token name
    { title: mintFormState?.name || 'Biconomy', route: '/tokens/001' },
    // Update the title of this into the actual schedule name
    { title: 'Schedule-01', route: '/tokens/001' }
  ];

  return (
    <SteppedLayout title="Claim token complete" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ClaimTokenComplete;
