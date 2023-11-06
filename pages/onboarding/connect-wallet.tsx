import Carousel from '@components/atoms/Carousel/Carousel';
import ConnectWalletOptions from '@components/molecules/ConnectWalletOptions/ConnectWalletOptions';
import PaddedLayout from '@components/organisms/Layout/PaddedLayout';
import styled from '@emotion/styled';
import useSafePush from '@hooks/useSafePush';
import AuthContext from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';

const Vesting = styled.div<{ background?: string }>`
  border-radius: 0 26px 26px 0;
  background: url(${({ background }) => background ?? '/images/background.png'});
  background-size: cover;
`;

const ConnectWalletPage: NextPage = () => {
  const { active, activate } = useWeb3React();
  const { onNext, startOnboarding, completeOnboarding } = useContext(OnboardingContext);
  const { user } = useContext(AuthContext);
  const { safePush } = useSafePush();
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
          else if (!activated) safePush(`/onboarding/${features?.auth?.memberOnly ? 'member-login' : 'sign-up'}`);
        })();
      }
    });
  }, [active]);

  return (
    <PaddedLayout>
      <div className="grid md:grid-cols-2 md:rounded-3xl md:shadow-xl max-w-[1152px]">
        <div className="flex flex-col justify-center items-center gap-8 py-6 px-8 order-1 md:order-0">
          <ConnectWalletOptions onConnect={handleConnectedState} />
        </div>
        <Vesting
          className="hidden md:flex flex-col items-center justify-center pt-12 pb-10 md:order-1"
          background={assets?.loginBgImage?.src}>
          <Carousel variant="dark" />
        </Vesting>
      </div>
    </PaddedLayout>
  );
};

export default ConnectWalletPage;
