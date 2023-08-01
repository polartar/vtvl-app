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
import { USE_NEW_API } from '@utils/constants';
import { transformSafe } from '@utils/safe';
// import AuthContext from '@providers/auth.context';
// import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import React, { useEffect, useState } from 'react';
import { fetchOrg } from 'services/db/organization';
import { createOrUpdateSafe, fetchSafeByAddress } from 'services/db/safe';
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
    if (organizationId && organization && user?.memberInfo?.id) {
      showLoading();
      try {
        const safe = await getSafeInfo(library, address);
        if (!safe) {
          throw 'Safe is not existed on-chain';
        }

        let safeFromDB = undefined;

        if (USE_NEW_API) {
          const newAPISafe = await SafeApiService.getSafeWalletsByAddress(address);
          if (newAPISafe) {
            safeFromDB = transformSafe({
              safe: newAPISafe,
              organizationId,
              organizationName: organization.name,
              userId: user?.memberInfo?.id || ''
            });
          }
        } else {
          safeFromDB = await fetchSafeByAddress(address);
        }

        if (!safeFromDB) {
          const findOrganization = USE_NEW_API ? organization : await fetchOrg(organizationId);
          if (findOrganization && safe) {
            const owners = await safe.getOwners();
            const threshold = await safe.getThreshold();
            const safeId = await createOrUpdateSafe({
              user_id: user?.uid,
              org_id: user?.memberInfo?.org_id || '',
              org_name: findOrganization.name,
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
              org_name: findOrganization.name,
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
                {safesChainDB.map(({ data: { safe_name, address } }, safeIndex) => (
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
                    selected={
                      importedSafe?.address?.toLowerCase() === address?.toLowerCase() ||
                      !safesFromChain.includes(address)
                    }
                    selectedLabel={
                      importedSafe?.address?.toLowerCase() === address?.toLowerCase() ? 'Selected' : 'Created'
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
