// import ArrowIcon from 'public/icons/arrow-small-left.svg';
import SafeApiService from '@api-services/SafeApiService';
import Button from '@components/atoms/Button/Button';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
// import BackButton from '@components/atoms/BackButton/BackButton';
import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import { Typography } from '@components/atoms/Typography/Typography';
import UnsupportedChainModal from '@components/organisms/UnsupportedChainModal';
import { useAuthContext } from '@providers/auth.context';
import { useLoaderContext } from '@providers/loader.context';
import { useUser } from '@store/useUser';
import { transformSafe } from '@utils/safe';
// import AuthContext from '@providers/auth.context';
// import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import { ISafeOwner } from 'interfaces/safe';
import React, { useEffect, useState } from 'react';
import { getSafeInfo } from 'services/gnosois';
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
  const {
    currentSafe: importedSafe,
    setCurrentSafe,
    user,
    organizationId,
    organization,
    setCurrentSafeId,
    fetchAllSafes,
    safesFromChain,
    safesChainDB
  } = useAuthContext();
  const { userId } = useUser();
  const [step, setStep] = useState<keyof typeof STEP_GUIDES>(1);
  const { showLoading, hideLoading } = useLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

  useEffect(() => {
    // if (!inProgress) startOnboarding(Step.SafeSetup);
    if (account && library && chainId) {
      (async () => {
        await fetchAllSafes();
      })();
    }
  }, [account]);

  const importSafe = async (address: string) => {
    console.log('IMPORT SAFE START', address, organizationId, organization, userId);
    if (organizationId && organization && userId) {
      showLoading();
      try {
        const safe = await getSafeInfo(library, address);
        if (!safe) {
          throw 'Safe is not existed on-chain';
        }

        // Use try catch here to hanle 404 status code from Safe API
        try {
          const newAPISafe = await SafeApiService.getSafeWallet(organizationId, address);
          console.log('NEW API SAFE', newAPISafe);
          if (newAPISafe) {
            setCurrentSafe(
              transformSafe({
                safe: newAPISafe,
                organizationId,
                organizationName: organization.name,
                userId: userId || ''
              })
            );
          } else if (organization && safe) {
            const owners = await safe.getOwners();
            const threshold = await safe.getThreshold();

            const saveSafe = await SafeApiService.addSafeWallet({
              organizationId,
              address: safe.getAddress(),
              chainId: chainId || 0,
              requiredConfirmations: threshold,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })) as ISafeOwner[]
            });

            setCurrentSafeId(saveSafe.id);
            setCurrentSafe({
              user_id: userId,
              org_id: organizationId || '',
              org_name: organization.name,
              address: safe.getAddress(),
              chainId: chainId || 0,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })),
              safe_name: saveSafe.name,
              threshold
            });
          }
        } catch (err) {
          if (organization && safe) {
            const owners = await safe.getOwners();
            const threshold = await safe.getThreshold();

            const saveSafe = await SafeApiService.addSafeWallet({
              organizationId,
              address: safe.getAddress(),
              chainId: chainId || 0,
              requiredConfirmations: threshold,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })) as ISafeOwner[]
            });

            setCurrentSafeId(saveSafe.id);
            setCurrentSafe({
              user_id: userId,
              org_id: organizationId || '',
              org_name: organization.name,
              address: safe.getAddress(),
              chainId: chainId || 0,
              owners: owners.map((owner) => ({
                address: owner,
                name: ''
              })),
              safe_name: saveSafe.name,
              threshold
            });
          }
        }
      } catch (error) {
        console.error('Importing safe error: ', error);
      }
      hideLoading();
    }
  };

  const handleBack = async () => {
    setStep(1);
    await fetchAllSafes();
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
            {safesChainDB?.length ? (
              /* Display all safes to import */
              <div className="flex flex-col gap-5 mt-5" style={{ marginBottom: '1.5em' }}>
                {safesChainDB.map(({ data: { safe_name, address }, isImported }, safeIndex) => (
                  <SafesListItem
                    key={`safe-${address}-${safeIndex}`}
                    label={
                      safe_name ? (
                        <div>
                          <div>{safe_name}</div>
                          <div>{address}</div>
                        </div>
                      ) : (
                        address
                      )
                    }
                    selected={importedSafe?.address?.toLowerCase() === address?.toLowerCase()}
                    buttonLabel={isImported ? 'Use this' : 'Import'}
                    selectedLabel={
                      importedSafe?.address?.toLowerCase() === address?.toLowerCase() ? 'Selected' : 'Imported'
                    }
                    onClick={async () => await importSafe(address)}
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
        return <SafeForm onBack={handleBack} />;
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
