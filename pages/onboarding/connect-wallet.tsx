import Carousel from '@components/atoms/Carousel/Carousel';
import ConnectWalletOptions from '@components/molecules/ConnectWalletOptions/ConnectWalletOptions';
import PaddedLayout from '@components/organisms/Layout/PaddedLayout';
import styled from '@emotion/styled';
import AuthContext from '@providers/auth.context';
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

const Vesting = styled.div`
  border-radius: 0 26px 26px 0;
  background: url('/images/background.png');
  background-size: cover;
`;

const ConnectWalletPage: NextPage = () => {
  const { active, activate } = useWeb3React();
  const { onNext, startOnboarding, completeOnboarding } = useContext(OnboardingContext);
  const { user, anonymousSignIn } = useContext(AuthContext);
  const [activated, setActivated] = useState(false);

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
          else if (!activated) Router.push('/onboarding/sign-up');
        })();
      }
    });
  }, [active]);

  const carouselItems = [
    {
      title: ['100% ', <strong>no-code</strong>, <br />, 'ready in minutes'],
      image: '/images/how-it-works/1.png',
      subtitle: 'Mint or bring your own token',
      description: 'Variable or fixed supply? No problem, you have options.'
    },
    {
      title: ['Create multiple ', <strong>vesting smart contracts</strong>, ' in just a few clicks'],
      image: '/images/how-it-works/2.png',
      subtitle: 'Generate smart contracts for investors & employees',
      description:
        'We get it, have your engineers build YOUR product and let us take care of the custom vesting systems'
    },
    {
      title: ['Automate ', <strong>custom token</strong>, ' distributions to your holders'],
      image: '/images/how-it-works/3.png',
      subtitle: 'Track your own tokens',
      description: 'Say goodbye to managing via spreadsheet.'
    },
    {
      title: ['Token vesting analytics ', <br />, <strong>coming soon!</strong>],
      image: '/images/how-it-works/4.png',
      subtitle: 'Token analytics coming soon',
      description: 'What you really want to know about your tokenomics.'
    }
  ];

  return (
    <PaddedLayout>
      <OnboardingContainer>
        <Signing>
          <ConnectWalletOptions onConnect={handleConnectedState} />
        </Signing>
        <Vesting className="flex flex-col items-center justify-center pt-12 pb-10">
          <Carousel variant="dark" items={carouselItems} />
        </Vesting>
      </OnboardingContainer>
    </PaddedLayout>
  );
};

export default ConnectWalletPage;
