import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';

const Complete: NextPageWithLayout = () => {
  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-2/5 mt-14 text-center">
      <h2 className="h4 text-neutral-900 mb-3">
        <strong>BICO</strong> token created successfully!
      </h2>
      <p className="text-gray-500 text-sm mb-9">
        Your delegated employee will received a notification and can proceed to create the vesting schedules.
      </p>
      <img src="/images/biconomy-logo.png" className="w-22 h-22 mb-4 mx-auto" />
      <h3 className="font-bold h4 uppercase mb-6">Biconomy</h3>
      <p className="text-sm text-neutral-500 mb-6">0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5</p>
      <div className="flex flex-row justify-center items-center border-t border-neutral-200 pt-5">
        <button className="primary" type="button">
          Create vesting contract
        </button>
      </div>
    </div>
  );
};

Complete.getLayout = function getLayout(page: ReactElement) {
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
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={2}>
      {page}
    </SteppedLayout>
  );
};

export default Complete;
