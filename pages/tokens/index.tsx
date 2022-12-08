import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import MyTokenDetails from '@components/molecules/MyTokenDetails/MyTokenDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import AuthContext from '@providers/auth.context';
import { useClaimTokensContext } from '@providers/claim-tokens.context';
import { useLoaderContext } from '@providers/loader.context';
import { useWeb3React } from '@web3-react/core';
import type { ERC20 } from 'contracts/ERC20';
import ERC20_ABI from 'contracts/abi/ERC20.json';
import { Contract } from 'ethers';
import useTokenContract from 'hooks/useTokenContract';
import { getContract } from 'hooks/web3';
import Router, { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { fetchTokenByQuery, fetchTokensByQuery } from 'services/db/token';
import { fetchAllVestings } from 'services/db/vesting';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { IToken, IVesting } from 'types/models';

const MyTokenStatus: NextPageWithLayout = () => {
  const { account, library } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoaderContext();
  const { vestingSchedules } = useClaimTokensContext();
  const { route } = useRouter();

  const [organizations, setOrganizations] = useState<{ [key: string]: boolean }>({});
  const [tab, setTab] = useState('all');
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [vestings, setVestings] = useState<{ [key: string]: IVesting }>({});

  // Check for Vesting schedules, then redirect to the first record
  useEffect(() => {
    if (vestingSchedules && vestingSchedules.length) {
      const selectFirst = vestingSchedules[0];
      Router.push(`/tokens/${selectFirst.id}`);
    }
  }, [vestingSchedules]);

  // const handleTabChange = (e: any) => {
  //   // Change token query based on currently selected tab
  //   setTab(e.target.value);
  // };

  // const statuses = [
  //   { label: 'All', value: 'all' },
  //   { label: 'Claimed', value: 'claimed' },
  //   { label: 'Unclaimed', value: 'unclaimed' }
  // ];

  // const fetchOrganizations = async () => {
  //   const vestings = await fetchAllVestings();
  //   if (vestings && vestings.length > 0 && account) {
  //     vestings.forEach((vesting) => {
  //       if (
  //         vesting.recipients &&
  //         vesting.recipients.length > 0 &&
  //         vesting.recipients.find((recipient) => recipient.walletAddress.toLowerCase() === account.toLowerCase())
  //       ) {
  //         setOrganizations({
  //           ...organizations,
  //           [vesting.organizationId]: true
  //         });
  //         setVestings({
  //           [vesting.organizationId]: vesting
  //         });
  //         hideLoading();
  //       }
  //     });
  //   }
  //   hideLoading();
  // };

  // // Remove this once there is an integration happening with the backend,
  // // but make sure to setIsPageLoading to false once actual data is loaded.
  // useEffect(() => {
  //   fetchOrganizations();
  // }, [user, account]);

  // useEffect(() => {
  //   if (organizations && Object.keys(organizations).length > 0) {
  //     const orgIds = Object.keys(organizations);
  //     orgIds.map((orgId) => {
  //       fetchTokenByQuery('organizationId', '==', orgId).then((res) => {
  //         if (res?.data) {
  //           setTokens([
  //             ...tokens.filter((token) => token.address.toLowerCase() !== res.data?.address.toLowerCase()),
  //             res.data
  //           ]);
  //         }
  //       });
  //     });
  //   }
  // }, [organizations]);

  return (
    <>
      <div className="w-full h-full">
        <div className={'max-w-4xl xl:max-w-full'}>
          <h1 className="text-neutral-900 mb-9">My Tokens</h1>
          {tokens && tokens.length > 0 ? (
            <>
              {/* <BarRadio name="statuses" options={statuses} value={tab} onChange={handleTabChange} variant="tab" /> */}
              <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tokens.map((info, idx) => (
                  <MyTokenDetails
                    key={`my-token-${idx}`}
                    token={info}
                    vesting={vestings[info.organizationId]}
                    // viewDetailsUrl="/tokens/schedule-001"
                  />
                ))}
              </div>
              {/* Probably need a condition to check if there are more records */}
              {/* <button type="button" className="primary line mx-auto flex py-1.5 my-5">
                Load more
              </button> */}
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
