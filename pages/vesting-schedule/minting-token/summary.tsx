import BackButton from '@components/atoms/BackButton/BackButton';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';

const Summary: NextPageWithLayout = () => {
  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-1/2 mt-14">
      <TokenProfile name="Biconomy" symbol="BICO" logo="/images/biconomy-logo.png" />
      <label className="mt-5">
        <span>Contract Address</span>
      </label>
      <progress value="75" max="100" className="w-full">
        75%
      </progress>
      <div className="border-y border-gray-300 mt-5 py-5 grid md:grid-cols-3">
        <label>
          <span>Supply cap</span>
          <p className="text-sm font-medium text-neutral-500">Unlimited</p>
        </label>
        <label>
          <span>Amount to mint</span>
          <p className="text-sm font-medium text-neutral-500">500,000</p>
        </label>
        <label>
          <span>Maximum supply</span>
          <p className="text-sm font-medium text-neutral-500">1,000,000,000</p>
        </label>
      </div>
      <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
        <BackButton label="Return to details" onClick={() => Router.push('/vesting-schedule/minting-token')} />
        <button
          className="primary"
          type="button"
          onClick={() => Router.push('/vesting-schedule/minting-token/complete')}>
          Create token
        </button>
      </div>
    </div>
  );
};

Summary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: 'vesting-schedule' },
    { title: 'Minting token', route: 'minting-token' }
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
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={1}>
      {page}
    </SteppedLayout>
  );
};

export default Summary;
