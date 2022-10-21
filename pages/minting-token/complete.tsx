import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useMintContext } from '@providers/mint.context';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { ReactElement } from 'react';

const Complete: NextPageWithLayout = () => {
  const { mintFormState } = useMintContext();
  const { tokenSymbol, tokenName, tokenLogo, contractAddress } = mintFormState;

  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-2/5 mt-14 text-center">
      <h2 className="h4 text-neutral-900 mb-3">
        <strong>{tokenSymbol}</strong> token created successfully!
      </h2>
      <p className="text-gray-500 text-sm mb-9">
        Your delegated employee will received a notification and can proceed to create the vesting schedules.
      </p>
      {/* <p className="text-gray-500 text-sm mb-9">
        The token creation is still in progress. In order to complete this step, 2 out of 3 owners are required to confirm this transaction.
      </p> */}
      {tokenLogo ? <img src={tokenLogo} className="w-22 h-22 mb-4 mx-auto" /> : null}
      <h3 className="font-bold h4 uppercase mb-6">{tokenName}</h3>
      <p className="text-sm text-neutral-500 mb-6">{contractAddress}</p>
      <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
        <button className="primary" type="button" onClick={() => Router.push('/vesting-schedule/configure')}>
          Create vesting contract
        </button>
        <a href="/dashboard" className="flex flex-row items-center gap-3 text-neutral-500">
          Continue later
          <ArrowIcon className="fill-current transform rotate-180" />
        </a>
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
