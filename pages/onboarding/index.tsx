import Carousel from '@components/atoms/Carousel/Carousel';
import Chip from '@components/atoms/Chip/Chip';
import WalletButton from '@components/atoms/WalletButton/WalletButton';
import Consent from '@components/molecules/Consent/Consent';
import Wallets from '@components/molecules/Wallets/Wallets';
import styled from '@emotion/styled';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import { NextPage } from 'next';
import React, { useContext, useEffect } from 'react';

const OnboardingContainer = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 26px;
  box-shadow: 0 10px 20px -15px rgba(56, 56, 56, 0.6);
  max-width: 1200px;
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
`;

const Description = styled.p`
  font-size: 0.875rem;
`;

const CTAContainer = styled.div`
  width: 100%;
  padding: 14px;

  &.split {
    margin-top: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &:not(.no-border) {
    border-top: 1px solid #d0d5dd;
    border-bottom: 1px solid #d0d5dd;
  }
`;

const WalletContainer = styled.div`
  width: 100%;
`;

const ConnectWalletPage: NextPage = () => {
  const { activate } = useWeb3React();
  const { onNext, setCurrentStep } = useContext(OnboardingContext);

  useEffect(() => {
    setCurrentStep(Step.ChainSetup);
  }, []);

  async function metamaskActivate() {
    try {
      await activate(injected);
      await onNext({});
    } catch (error) {
      console.log('connection error ', error);
    }
  }

  async function walletConnectActivate() {
    try {
      await activate(walletconnect);
      await onNext({});
    } catch (error) {
      console.log('connection error ', error);
    }
  }

  const wallets = [
    {
      name: 'MetaMask',
      image: '/icons/wallets/metamask.svg',
      onClick: metamaskActivate
    },
    {
      name: 'Wallet Connect',
      image: '/icons/wallets/walletconnect.svg',
      onClick: walletConnectActivate
    },
    {
      name: 'Members Login',
      image: '/icons/wallets/space-suit.svg'
    },
    {
      name: 'Coinbase Wallet',
      image: '/icons/wallets/coinbase.png',
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Ledger',
      image: '/icons/wallets/ledger.png',
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Trezor',
      image: '/icons/wallets/trezor.png',
      subLabel: 'Soon',
      disabled: true
    }
  ];
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
    <OnboardingContainer>
      <Signing>
        <div>
          <h1 className="font-medium">Connect to your wallet</h1>
          <p className="text-sm text-neutral-500">Please select a wallet to connect to this app</p>
        </div>
        <WalletContainer>
          <Wallets wallets={wallets} />
          <div className="my-5 text-xs text-neutral-600 font-medium">
            <span>Can&apos;t find your wallet?</span>&nbsp;
            <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
              Suggest Wallet
            </a>
          </div>
          <Consent />
        </WalletContainer>
      </Signing>
      <Vesting className="flex flex-col items-center justify-start pt-24 pb-14">
        <Carousel variant="dark" items={carouselItems} />
      </Vesting>
    </OnboardingContainer>
  );
};

export default ConnectWalletPage;
