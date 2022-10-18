import BackButton from '@components/atoms/BackButton/BackButton';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import AuthContext from '@providers/auth.context';
import OnboardingContext from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import useEagerConnect from 'hooks/useEagerConnect';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { createSafe } from 'services/db/safe';
import { fetchSafes, getSafeInfo } from 'services/gnosois';

const YourSafesPage: NextPage = () => {
  const triedToEagerConnect = useEagerConnect();
  const { active, account, chainId, library } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { onPrevious, onNext } = useContext(OnboardingContext);
  const [safes, setSafes] = useState<string[]>();

  useEffect(() => {
    if (account && library && chainId) {
      (async () => {
        const resp = await fetchSafes(library, account, chainId);
        console.log('fetched safes here ', resp);
        if (resp) setSafes(resp.safes);
      })();
    }
  }, [account]);

  const importSafe = async (address: string) => {
    if (!active || !chainId || !library) {
      console.log('Please login with metamask to create safe');
      return;
    }
    console.log('trying import ');
    if (!user) {
      console.log('Please login to import safe');
      return;
    }
    try {
      const safe = await getSafeInfo(library, address);
      if (!safe) {
        console.log(
          "Unable to get info for this safe address, please make sure it's a valid safe address or try again"
        );
        return;
      }

      const owners = await safe.getOwners();
      const threshold = await safe.getThreshold();
      const storedSafeId = await createSafe({
        user_id: user?.uid,
        address,
        chainId: chainId,
        owners: owners.map((o) => {
          return { name: '', address: o };
        }),
        threshold
      });
      onNext({ safeId: storedSafeId });
      // Router.push({
      //   pathname: '/onboarding/new-safe',
      //   query: { safeAddress: address }
      // })
    } catch (error) {
      console.log('error importing safe ', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your safe</h1>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">
          You can natively create new, import or login to your existing gnosis safe multisig.
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
                  onClick={async () => await importSafe(safe)}
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
                    <strong onClick={() => Router.push('/onboarding/new-safe')}>Create New Safe</strong>,
                    '".'
                  ]}
                />
              </div>
              <div className="border-t border-b border-neutral-200 p-3 flex items-center justify-center">
                <button className="line primary" type="button" onClick={() => Router.push('/onboarding/new-safe')}>
                  Create New Safe
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-row justify-between items-center mt-6">
          <BackButton label="Return to account setup" onClick={() => onPrevious()} />
          <button className="flex flex-row items-center gap-2 primary group" type="button" onClick={() => onNext({})}>
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
