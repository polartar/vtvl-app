// import ArrowIcon from 'public/icons/arrow-small-left.svg';
import Button from '@components/atoms/Button/Button';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
// import BackButton from '@components/atoms/BackButton/BackButton';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import { Typography } from '@components/atoms/Typography/Typography';
// import AuthContext from '@providers/auth.context';
// import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import Router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { fetchSafes } from 'services/gnosois';

export default function GonsisSafe() {
  const { account, chainId, library } = useWeb3React();
  // const { inProgress, startOnboarding } = useContext(OnboardingContext);
  const [safes, setSafes] = useState<string[]>();

  useEffect(() => {
    // if (!inProgress) startOnboarding(Step.SafeSetup);
    if (account && library && chainId) {
      (async () => {
        try {
          const resp = await fetchSafes(library, account, chainId);
          console.log('fetched safes here ', resp);
          if (resp) setSafes(resp.safes);
        } catch (error) {
          console.error(error);
          // setImportSafeError((error as any).message);
        }
      })();
    }
  }, [account]);

  const importSafe = async (address: string) => {
    Router.push({
      pathname: '/onboarding/new-safe',
      query: { address, returnUrl: Router.asPath }
    });
  };

  return (
    <div className="w-full flex gap-6">
      <div className="w-[400px] ml-6">
        <Typography variant="inter" size="title" className="font-medium text-neutral-900">
          Your Safes
        </Typography>
        <br />
        <Typography variant="inter" size="body" className="font-medium text-neutral-500">
          You can natively create new, import or login to your existing Safe multisig
        </Typography>
      </div>
      <div className="w-full p-6">
        <div className="border border-neutral-300 p-6 rounded-[24px]">
          <Typography variant="inter" size="subtitle" className="font-semibold">
            Your Safes
          </Typography>
          <br />
          <Typography variant="inter" size="body" className="font-medium text-neutral-500">
            Create a new Safe or import your existing one.
          </Typography>
          <br />
          {safes?.length ? (
            /* Display all safes to import */
            <div className="flex flex-col gap-5 mt-5" style={{ marginBottom: '1.5em' }}>
              {safes.map((safe, safeIndex) => (
                <SafesListItem
                  key={`safe-${safe}-${safeIndex}`}
                  label={safe}
                  onClick={async () => await importSafe(safe)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center mt-12 mb-6">
              <EmptyState title={'No safes found'} />
            </div>
          )}

          <div className="flex justify-center mt-4">
            <Button
              primary
              onClick={() => Router.push({ pathname: '/onboarding/new-safe', query: { returnUrl: Router.asPath } })}>
              Create new safe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
