import Copy from '@components/atoms/Copy/Copy';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import useSafePush from '@hooks/useSafePush';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import Link from 'next/link';
import { NextPageWithLayout } from 'pages/_app';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { ReactElement, useEffect } from 'react';

const Complete: NextPageWithLayout = () => {
  const { mintFormState, isTokenLoading } = useTokenContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { safePush } = useSafePush();

  useEffect(() => {
    if (isTokenLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isTokenLoading]);

  useEffect(() => {
    if (!mintFormState) {
      safePush('/minting-token');
    }
  }, [mintFormState]);

  return (
    <>
      <div className="panel rounded-lg mx-auto w-full max-w-lg mt-14 text-center">
        <h2 className="h4 text-neutral-900 mb-3">
          <strong>{mintFormState?.symbol}</strong> token created successfully!
        </h2>
        {mintFormState?.logo ? <img src={mintFormState.logo} className="w-20 h-20 mb-4 mx-auto rounded-full" /> : null}
        <h3 className="font-bold h4 uppercase mb-6">{mintFormState?.name}</h3>
        <div className="mb-4">
          <Copy text={mintFormState?.address || ''}>
            <p className="text-sm text-neutral-500">{mintFormState?.address}</p>
          </Copy>
        </div>
        <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
          <button className="primary" type="button" onClick={() => safePush('/vesting-schedule/add-recipients')}>
            Create schedule
          </button>
          <Link href="/dashboard">
            <span className="flex flex-row items-center gap-3 text-neutral-500">
              Continue later
              <ArrowIcon className="fill-current transform rotate-180" />
            </span>
          </Link>
        </div>
      </div>
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
