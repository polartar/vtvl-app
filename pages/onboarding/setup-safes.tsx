import BackButton from '@components/atoms/BackButton/BackButton';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import AuthContext from '@providers/auth.context';
import OnboardingContext from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import Router from 'next/router';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import React, { useContext, useEffect, useState } from 'react';
import { fetchSafes } from 'services/gnosois';

const YourSafesPage: NextPage = () => {
  const { active, account, chainId, library } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { onPrevious, onNext } = useContext(OnboardingContext);
  const [safes, setSafes] = useState<string[]>();
  const [importSafeError, setImportSafeError] = useState();

  useEffect(() => {
    if (account && library && chainId) {
      (async () => {
        try {
          const resp = await fetchSafes(library, account, chainId);
          console.log('fetched safes here ', resp);
          if (resp) setSafes(resp.safes);
        } catch (error: any) {
          console.error(error);
          setImportSafeError(error.message);
        }
      })();
    }
  }, [account]);

  const importSafe = async (address: string) => {
    Router.push({
      pathname: '/onboarding/new-safe',
      query: { address }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl">
      <h1 className="text-neutral-900">Setup your multi-sig safe</h1>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">Natively create a new Safe or login to your existing one</p>
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
                <EmptyState title={importSafeError ? importSafeError : 'No safes found'} />
              </div>
              <div className="border-b border-neutral-200 pb-5 flex items-center justify-center">
                <button
                  className="primary"
                  type="button"
                  disabled={importSafeError}
                  onClick={() => Router.push('/onboarding/new-safe')}>
                  Create New Safe
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-row justify-between items-center mt-6">
          <BackButton label="Back to account setup" onClick={() => onPrevious()} />
          <button
            className="flex flex-row items-center gap-2 primary line group transition-all transform"
            type="button"
            onClick={() => onNext({})}>
            I'm good without multi-sig{' '}
            <ArrowIcon
              alt="Proceed"
              className="rotate-180 transform transition-all w-3 h-3 group-hover:translate-x-1 fill-current stroke-current text-primary-900 group-hover:text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YourSafesPage;
