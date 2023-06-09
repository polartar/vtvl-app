import BackButton from '@components/atoms/BackButton/BackButton';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import Hint from '@components/atoms/Hint/Hint';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import { Typography } from '@components/atoms/Typography/Typography';
import MetamaskUnsupportedChainModal from '@components/organisms/MetamaskUnsupportedChainModal';
import UnsupportedChainModal from '@components/organisms/UnsupportedChainModal';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import { NextPage } from 'next';
import Router from 'next/router';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import React, { useContext, useEffect, useState } from 'react';
import { fetchSafes } from 'services/gnosois';
import { SafeSupportedChains } from 'types/constants/supported-chains';

const YourSafesPage: NextPage = () => {
  const { active, account, chainId, library, error } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { onPrevious, onNext, inProgress, startOnboarding } = useContext(OnboardingContext);
  const { ModalWrapper: ModalWrapper1, showModal: showModal1, hideModal: hideModal1 } = useModal({});
  const { ModalWrapper: ModalWrapper2, showModal: showModal2, hideModal: hideModal2 } = useModal({});
  const [safes, setSafes] = useState<string[]>();
  const [importSafeError, setImportSafeError] = useState();

  useEffect(() => {
    if (!inProgress) startOnboarding(Step.SafeSetup);
    if (error instanceof UnsupportedChainIdError) {
      showModal1();
    }
    if (account && library && chainId) {
      if (!SafeSupportedChains.find((c) => c === chainId)) {
        showModal2();
        return;
      }
      hideModal2();
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
  }, [account, library, chainId, error]);

  const importSafe = async (address: string) => {
    Router.push({
      pathname: '/onboarding/new-safe',
      query: { address }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl">
      <div className="text-center">
        <Typography
          size="title"
          variant="sora"
          className="font-medium text-neutral-900 mb-1 flex flex-row items-center gap-1">
          Setup your multi-sig{' '}
          <Hint
            tip={
              <>
                <i>Safe</i> is a multi-signature smart contract wallet that allows users to define a list of
                owner/signer accounts and a threshold number of signers required to confirm a transaction.
              </>
            }>
            <img src="/images/safe.png" className="w-28" alt="Safe" />
          </Hint>
        </Typography>
        <p className="text-xs font-medium">
          Need help with what exactly is Safe?{' '}
          <a
            className="text-primary-900"
            href="https://help.safe.global/en/articles/40869-what-is-safe"
            target="_blank">
            Give me more info
          </a>
        </p>
      </div>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your Safes</h2>
        <p className="text-sm text-neutral-500">Create a new Safe or import an existing Safe</p>
        <div className="mt-5">
          <p className="text-sm text-neutral-500">Your existing Safe(s)</p>
          {safes?.length && (
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
          )}
          <>
            {(!safes || safes?.length == 0) && (
              <div className="flex items-center justify-center mt-12 mb-6">
                <EmptyState title={importSafeError ? importSafeError : 'No safes found'} />
              </div>
            )}
            <div className="border-b border-neutral-200 pb-5 flex flex-col items-center">
              {safes && safes.length ? <div className="text-sm my-3">Or</div> : null}
              <button
                className="primary"
                type="button"
                disabled={importSafeError}
                onClick={() => Router.push('/onboarding/new-safe')}>
                Create new Safe
              </button>
            </div>
          </>
        </div>

        <div className="flex flex-row justify-between items-center mt-6">
          <BackButton label="Back to account setup" onClick={() => onPrevious()} />
          <button
            className="flex flex-row items-center gap-2 primary line group transition-all transform"
            type="button"
            onClick={() => onNext({ skipSafe: true })}>
            I'm good without multi-sig{' '}
            <ArrowIcon
              alt="Proceed"
              className="rotate-180 transform transition-all w-3 h-3 group-hover:translate-x-1 fill-current stroke-current text-primary-900 group-hover:text-white"
            />
          </button>
        </div>
      </div>
      <ModalWrapper1>
        <MetamaskUnsupportedChainModal hideModal={hideModal1} />
      </ModalWrapper1>
      <ModalWrapper2>
        <UnsupportedChainModal hideModal={hideModal2} />
      </ModalWrapper2>
    </div>
  );
};

export default YourSafesPage;
