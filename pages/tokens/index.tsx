import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import MyTokenDetails, { IClaimable, ITokenDetails } from '@components/molecules/MyTokenDetails/MyTokenDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import AuthContext from '@providers/auth.context';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { fetchTokensByQuery } from 'services/db/token';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';

const MyTokenStatus: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);

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

  interface IVestingSummary {
    name: string;
    totalAllocation: number;
    totalVested: number;
    claimed: number;
    unclaimed: number;
    startDateTime: string;
    endDateTime: string;
  }

  interface ITokenInfo {
    token?: ITokenDetails;
    vesting?: IVestingSummary;
    claimable?: IClaimable;
  }

  const [showTokens, setShowTokens] = useState(false);
  const [tokens, setTokens] = useState<ITokenInfo[]>();
  const _tokens = [
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

  const [isPageLoading, setIsPageLoading] = useState(true);

  // Remove this once there is an integration happening with the backend,
  // but make sure to setIsPageLoading to false once actual data is loaded.
  useEffect(() => {
    setUpTokens();
  }, [user]);

  const setUpTokens = async () => {
    const orgId = user?.memberInfo?.org_id || '';
    console.log('orgId is ', orgId);

    if (!orgId) {
      console.log('no org id');
      setIsPageLoading(false);
      return;
    }
    const tkns = await fetchTokensByQuery('organizationId', '==', orgId);

    if (!tkns) {
      console.log('no token fetched.');
      setIsPageLoading(false);
      return;
    }

    const resultTokens = await Promise.all(
      tkns.map(async (t) => {
        const v = await fetchVestingContractByQuery('tokenAddress', '==', t.get('address'));
        console.log('v here is ', v);
        // if(!v) { console.log("no vesting contract for token fetched."); return; }
        //TODO: figure out how to link vestings to represent data
        return {
          token: {
            name: t.get('name'),
            symbol: t.get('symbol'),
            logo: t.get('logo'),
            address: t.get('address'),
            decimals: t.get('decimals') || ''
          }
        };
      })
    );

    setTokens([...resultTokens]);
    setShowTokens(true);
    setIsPageLoading(false);
    console.log('we have tokens for org here ', resultTokens);
  };

  return (
    <>
      <PageLoader isLoading={isPageLoading}>
        <div className="w-full h-full">
          <div className={showTokens ? 'max-w-4xl xl:max-w-full' : ''}>
            <h1 className="text-neutral-900 mb-9">My Tokens</h1>
            {showTokens ? (
              <>
                <BarRadio name="statuses" options={statuses} value={tab} onChange={handleTabChange} variant="tab" />
                <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {tokens?.map(
                    (info, idx) =>
                      info.token && (
                        <MyTokenDetails
                          key={`my-token-${idx}`}
                          token={info?.token}
                          viewDetailsUrl="/tokens/schedule-001"
                        />
                      )
                  )}
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
      </PageLoader>
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
