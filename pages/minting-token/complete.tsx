import PageLoader from '@components/atoms/PageLoader/PageLoader';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { ReactElement, useEffect, useState } from 'react';
import { fetchSafeByQuery } from 'services/db/safe';

const Complete: NextPageWithLayout = () => {
  const { account } = useWeb3React();
  const { mintFormState, isTokenLoading } = useTokenContext();
  const { safe } = useAuthContext();
  const [isMultiSig, setIsMultiSig] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!mintFormState) {
      Router.push('/minting-token');
    }
  }, [mintFormState]);

  // Set if using multisig
  useEffect(() => {
    setIsMultiSig(Boolean(safe?.address) && !account);
  }, [safe, account]);

  // Remove loader when token is fetched
  useEffect(() => {
    if (!isTokenLoading || !mintFormState.address) setIsPageLoading(false);
  }, [isTokenLoading]);

  return (
    <>
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <div className="panel rounded-lg mx-auto w-full max-w-lg mt-14 text-center">
          <h2 className="h4 text-neutral-900 mb-3">
            {isMultiSig ? (
              'Transaction has been created'
            ) : (
              <>
                <strong>{mintFormState?.symbol}</strong> token created successfully!
              </>
            )}
          </h2>
          {/* <p className="text-gray-500 text-sm mb-9">
        Your delegated employee will received a notification and can proceed to create the vesting schedules.
      </p> */}
          {isMultiSig ? (
            <p className="text-gray-500 text-sm mb-9">
              The creation of token is in progress. In order for this process to be complete, 2 out of 3 owners are
              required to execute this transaction.
            </p>
          ) : null}
          {mintFormState?.logo ? (
            <img src={mintFormState.logo} className="w-20 h-20 mb-4 mx-auto rounded-full" />
          ) : null}
          <h3 className="font-bold h4 uppercase mb-6">{mintFormState?.name}</h3>
          <p className="text-sm text-neutral-500 mb-6">{mintFormState?.address}</p>
          <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
            {!isMultiSig ? (
              <button className="primary" type="button" onClick={() => Router.push('/vesting-schedule/configure')}>
                Create schedule
              </button>
            ) : null}
            <a href="/dashboard" className="flex flex-row items-center gap-3 text-neutral-500">
              Continue later
              <ArrowIcon className="fill-current transform rotate-180" />
            </a>
            {isMultiSig ? (
              <button className="primary" type="button" onClick={() => Router.push('/dashboard')}>
                Create vesting contract
              </button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

Complete.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Minting token', route: '/minting-token' }
  ];

  // Update these into a state coming from the context
  const mintingSteps = [
    {
      title: 'Token details',
      desc: 'Setup your token details'
    },
    {
      title: 'Token summary',
      desc: 'Please review the details'
    },
    {
      title: 'Finished',
      desc: 'Token created successfully!'
    }
  ];
  return (
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={2}>
      {page}
    </SteppedLayout>
  );
};

export default Complete;
