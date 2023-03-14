import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useClaimTokensContext } from '@providers/claim-tokens.context';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useEffect } from 'react';

const MyTokenStatus: NextPageWithLayout = () => {
  const { vestingSchedules } = useClaimTokensContext();

  // Check for Vesting schedules, then redirect to the first record
  useEffect(() => {
    if (vestingSchedules && vestingSchedules.length) {
      const selectFirst = vestingSchedules[0];
      Router.push(`/tokens/${selectFirst.id}`);
    }
  }, [vestingSchedules]);

  return (
    <>
      <div className="w-full h-full">
        <div className={'max-w-4xl xl:max-w-full'}>
          <h1 className="text-neutral-900 mb-9">My Tokens</h1>
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No claimable tokens"
            description={<>Come back again next time.</>}
          />
        </div>
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
MyTokenStatus.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'My tokens', route: '/tokens/all' }];
  return (
    <SteppedLayout title="" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default MyTokenStatus;
