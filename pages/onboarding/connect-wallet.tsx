import Carousel from '@components/atoms/Carousel/Carousel';
import ConnectWalletOptions from '@components/molecules/ConnectWalletOptions/ConnectWalletOptions';
import PaddedLayout from '@components/organisms/Layout/PaddedLayout';
import styled from '@emotion/styled';
import AuthContext from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

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
  const { active, activate } = useWeb3React();
  const { onNext, startOnboarding, completeOnboarding } = useContext(OnboardingContext);
  const { user } = useContext(AuthContext);
  const [activated, setActivated] = useState(false);
  const {
    website: { assets, features }
  } = useGlobalContext();

  // When a wallet is connected
  const handleConnectedState = () => {
    setActivated(true);
    onNext({});
  };

  useEffect(() => {
    startOnboarding(Step.ChainSetup);
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        console.log('activated, user is ', user);
        (async () => {
          await activate(injected, undefined, true);
          if (user) completeOnboarding();
          else if (!activated) Router.push(`/onboarding/${features?.auth?.memberOnly ? 'member-login' : 'sign-up'}`);
        })();
      }
    });
  }, [active]);

  return (
    <PaddedLayout>
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
    </PaddedLayout>
  );
};

export default ConnectWalletPage;
