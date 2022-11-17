import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import MyTokenDetails from '@components/molecules/MyTokenDetails/MyTokenDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useState } from 'react';

const MyTokenStatus: NextPageWithLayout = () => {
  // Fetch token based on status at initial load
  // Statuses are: All / Claimed / Unclaimed
  const statuses = [
    { label: 'All', value: 'all' },
    { label: 'Claimed', value: 'claimed' },
    { label: 'Unclaimed', value: 'unclaimed' }
  ];

  const [tab, setTab] = useState('all');

  const handleTabChange = (e: any) => {
    // Change token query based on currently selected tab
    setTab(e.target.value);
  };

  const [showTokens, setShowTokens] = useState(false);
  const tokens = [
    {
      token: {
        name: 'Biconomy',
        logo: '/images/biconomy-logo.png',
        symbol: 'BICO',
        address: '0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5'
      },
      vesting: {
        name: 'Voyager-0123',
        totalAllocation: 100000,
        totalVested: 25000,
        claimed: 0,
        unclaimed: 500,
        startDateTime: new Date(2022, 9, 25, 20, 12),
        endDateTime: new Date(2022, 11, 23, 8, 10)
      },
      claimable: { isClaimable: true, token: 500 }
    },
    {
      token: {
        name: 'Cardano',
        logo: 'https://changelly.com/blog/wp-content/uploads/2022/04/688700b41a939acf4cad09e9c84bcff6.jpg',
        symbol: 'ADA',
        address: '0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5'
      },
      vesting: {
        name: 'Apollo-11',
        totalAllocation: 45000000,
        totalVested: 125000,
        claimed: 0,
        unclaimed: 1000,
        startDateTime: new Date(2022, 9, 25, 20, 12),
        endDateTime: new Date(2022, 11, 23, 8, 10)
      },
      claimable: { isClaimable: false, token: 0 }
    }
  ];

  return (
    <div className="w-full">
      <div className="max-w-4xl xl:max-w-full">
        <h1 className="text-neutral-900 mb-9">My Tokens</h1>
        {showTokens ? (
          <>
            <BarRadio name="statuses" options={statuses} value={tab} onChange={handleTabChange} variant="tab" />
            <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tokens.map((token, tokenIndex) => (
                <MyTokenDetails key={`my-token-${tokenIndex}`} {...token} viewDetailsUrl="/tokens/schedule-001" />
              ))}
            </div>
            {/* Probably need a condition to check if there are more records */}
            <button type="button" className="primary line mx-auto flex py-1.5 my-5">
              Load more
            </button>
          </>
        ) : (
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No claimable tokens"
            description={<>Come back again next time.</>}
          />
        )}
      </div>
    </div>
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
