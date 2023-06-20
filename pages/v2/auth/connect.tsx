import useAuth from '@api-hooks/useAuth';
import useOrganization from '@api-hooks/useOrganization';
import Carousel from '@components/atoms/Carousel/Carousel';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import ConnectWalletOptions from '@components/molecules/ConnectWalletOptions/ConnectWalletOptions';
import PaddedLayout from '@components/organisms/Layout/PaddedLayout';
import styled from '@emotion/styled';
import { getOrgStore } from '@hooks/useOrganizations';
import { useGlobalContext } from '@providers/global.context';
import { toUTCString } from '@utils/date';
import { SIGN_MESSAGE_TEMPLATE } from '@utils/web3';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const OnboardingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 26px;
  box-shadow: 0 10px 20px -15px rgba(56, 56, 56, 0.6);
  max-width: 1152px;
  font-weight: medium;
`;
const Signing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  text-align: center;
  padding: 48px 36px;
  border: 1px solid #d0d5dd;
  border-right: none;
  border-radius: 26px 0 0 26px;
`;

const Vesting = styled.div<{ background?: string }>`
  border-radius: 0 26px 26px 0;
  background: url(${({ background }) => background ?? '/images/background.png'});
  background-size: cover;
`;

const ConnectWalletPage: NextPage = () => {
  const { active, account, activate, library } = useWeb3React();
  const { connectWallet } = useAuth();
  const { getOrganizations } = useOrganization();
  const { organizations } = getOrgStore();
  const [activated, setActivated] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const {
    website: { assets, features }
  } = useGlobalContext();
  const router = useRouter();

  // When a wallet is connected
  const handleConnectedState = () => {
    setActivated(true);
  };

  useEffect(() => {
    // startOnboarding(Step.ChainSetup);
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        setIsSigning(true);
        (async () => {
          await activate(injected, undefined, true);
          if (active && account) {
            const currentDate = toUTCString(new Date());
            const signature = await library.provider.request({
              method: 'personal_sign',
              params: [SIGN_MESSAGE_TEMPLATE(account, currentDate), account]
            });
            await connectWallet({ address: account, signature, utcTime: currentDate });

            // Ensure wallet is validated
            // Identify which url should the user be redirected to based on his/her current role
            // Probably get the details of the user and check there
            try {
              await getOrganizations();
              if (!organizations?.length) {
                // No associated org, new user
                // redirect to account setup
                // POST /organization
                router.push('/v2/onboarding/account-setup');
              } else {
                // Has an associated organization, therefore is an existing user
              }
              console.log('useMAGIC organizations', organizations);
            } catch (err) {
              console.log('ERror organization', err);
            }
          }
        })();
      } else {
        setIsSigning(false);
      }
    });
  }, [active, account]);

  return (
    <PaddedLayout>
      {isSigning ? (
        <PageLoader />
      ) : (
        <OnboardingContainer>
          <Signing>
            <ConnectWalletOptions onConnect={handleConnectedState} />
          </Signing>
          <Vesting
            className="flex flex-col items-center justify-center pt-12 pb-10"
            background={assets?.loginBgImage?.src}>
            <Carousel variant="dark" />
          </Vesting>
        </OnboardingContainer>
      )}
    </PaddedLayout>
  );
};

export default ConnectWalletPage;
