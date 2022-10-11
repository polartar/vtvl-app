import React, { useContext, useEffect } from 'react';
import { NextPage } from 'next';
import Router from 'next/router';
import BackButton from '@components/atoms/BackButton/BackButton';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import OnboardingContext from 'providers/onboarding.context';

const YourSafesPage: NextPage = () => {
  // Comment/uncomment to see the two states
  // const safes: string[] = [];
  const { safe, error, safes } = useContext(OnboardingContext);

  useEffect(()=>{
    console.log("ssafes here is ", safes)
  },[])

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your safe</h1>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">
          You can natively create new, import or login to your existing gnisis safe multisig.
        </p>
        <div className="mt-5">
          <p className="text-sm text-neutral-500">List of {safes?.length} safes</p>
          {safes?.length ? (
            /* Display all safes to import */
            <div className="flex flex-col gap-5 mt-5">
              {safes.map((safe, safeIndex) => (
                <SafesListItem
                  key={`safe-${safe}-${safeIndex}`}
                  label={safe}
                  onClick={() => Router.push('/onboarding/confirmation')}
                />
              ))}
            </div>
          ) : (
            /* Else, display empty */
            <>
              <div className="flex items-center justify-center mt-12 mb-6">
                <EmptyState
                  title="No safes found"
                  description={[
                    'Setup a new multi-signature wallet. Get started by clicking on "',
                    <strong onClick={()=> Router.push('')}>Create New Safe</strong>,
                    '".'
                  ]}
                />
              </div>
              <div className="border-t border-b border-neutral-200 p-3 flex items-center justify-center">
                <button className="line primary" type="button" onClick={() => Router.push('/onboarding/confirmation')}>
                  Create New Safe
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-row justify-between items-center mt-6">
          <BackButton label="Return to account setup" href="/onboarding/account-setup" />
          <button
            className="flex flex-row items-center gap-2 primary group"
            type="button"
            onClick={() => Router.push('/dashboard')}>
            Skip{' '}
            <img
              src="/icons/arrow-small-right-white.svg"
              alt="Proceed"
              className="transition-all w-6 h-6 group-hover:translate-x-1 fill-current text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YourSafesPage;
