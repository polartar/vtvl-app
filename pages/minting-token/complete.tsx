import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { ReactElement, useEffect } from 'react';

const Complete: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();

  useEffect(() => {
    if (!mintFormState) {
      Router.push('/minting-token');
    }
  }, [mintFormState]);

  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-2/5 mt-14 text-center">
      <h2 className="h4 text-neutral-900 mb-3">
        Transaction is sent succesfully!
        {/* <strong>{mintFormState?.symbol}</strong> logo: token created address: successfully! */}
      </h2>
      {/* <p className="text-gray-500 text-sm mb-9">
        Your delegated employee will received a notification and can proceed to create the vesting schedules.
      </p> */}
      <p className="text-gray-500 text-sm mb-9">
        The token creation is still in progress. In order to complete this step, 2 out of 3 owners is required to
        confirm this transaction.
      </p>
      {mintFormState?.logo ? <img src={mintFormState.logo} className="w-22 h-22 mb-4 mx-auto" /> : null}
      <h3 className="font-bold h4 uppercase mb-6">{mintFormState?.name}</h3>
      <p className="text-sm text-neutral-500 mb-6">{mintFormState?.address}</p>
      <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
        <a href="/dashboard" className="flex flex-row items-center gap-3 text-neutral-500">
          Continue later
          <ArrowIcon className="fill-current transform rotate-180" />
        </a>
        <button className="primary" type="button" onClick={() => Router.push('/dashboard')}>
          Create vesting contract
        </button>
      </div>
    </div>
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
