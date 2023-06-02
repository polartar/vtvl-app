// import ArrowIcon from 'public/icons/arrow-small-left.svg';
import Button from '@components/atoms/Button/Button';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
// import BackButton from '@components/atoms/BackButton/BackButton';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import { Typography } from '@components/atoms/Typography/Typography';
import UnsupportedChainModal from '@components/organisms/UnsupportedChainModal';
import { useAuthContext } from '@providers/auth.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
// import AuthContext from '@providers/auth.context';
// import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import Router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { fetchOrg } from 'services/db/organization';
import { createOrUpdateSafe, fetchSafeByAddress } from 'services/db/safe';
import { fetchSafes, getSafeInfo } from 'services/gnosois';
import { SafeSupportedChains } from 'types/constants/supported-chains';

import SafeForm from './SafeForm';

const STEP_GUIDES = {
  1: 'Your Safes',
  2: 'Create new Safe',
  3: 'Owners and Confirmations'
};

export default function GonsisSafe() {
  const { account, chainId, library } = useWeb3React();
  // const { inProgress, startOnboarding } = useContext(OnboardingContext);
  const [safes, setSafes] = useState<string[]>();
  const { currentSafe: importedSafe, setCurrentSafe, user, organizationId, setCurrentSafeId } = useAuthContext();
  const [step, setStep] = useState<keyof typeof STEP_GUIDES>(1);
  const { showLoading, hideLoading } = useLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

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
    if (organizationId) {
      showLoading();
      try {
        const safe = await getSafeInfo(library, address);
        if (!safe) {
          throw 'Safe is not existed on-chain';
        }

        const safeFromDB = await fetchSafeByAddress(address);
        if (!safeFromDB) {
          const organization = await fetchOrg(organizationId);
          if (organization && safe) {
            const owners = await safe.getOwners();
            const threshold = await safe.getThreshold();
            const safeId = await createOrUpdateSafe({
              user_id: user?.uid,
              org_id: user?.memberInfo?.org_id || '',
              org_name: organization.name,
              address: safe.getAddress(),
              chainId: chainId || 0,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })),
              threshold
            });
            setCurrentSafeId(safeId);
            setCurrentSafe({
              user_id: user?.uid,
              org_id: user?.memberInfo?.org_id || '',
              org_name: organization.name,
              address: safe.getAddress(),
              chainId: chainId || 0,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })),
              threshold
            });
          }
        } else {
          setCurrentSafe(safeFromDB);
        }
      } catch (error) {
        console.error('Importing safe error: ', error);
      }
      hideLoading();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
                    selected={importedSafe?.address?.toLowerCase() === safe?.toLowerCase()}
                    selectedLabel={'Selected'}
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
              <Button primary onClick={() => setStep(2)}>
                Create new safe
              </Button>
            </div>
          </div>
        );
      case 2:
        return <SafeForm onBack={() => setStep(1)} />;
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (!chainId || !SafeSupportedChains.find((c) => c === chainId)) {
      showModal();
    }
  }, [chainId]);

  return (
    <div className="w-full flex gap-6">
      <div className="w-[400px] ml-6">
        <Typography variant="inter" size="title" className="font-medium text-neutral-900">
          {STEP_GUIDES[step]}
        </Typography>
        <br />
        <Typography variant="inter" size="body" className="font-medium text-neutral-500">
          You can natively create new, import or login to your existing Safe multisig
        </Typography>
      </div>
      <div className="w-full p-6">{renderStep()}</div>
      <ModalWrapper>
        <UnsupportedChainModal hideModal={hideModal} />
      </ModalWrapper>
    </div>
  );
}
