import Carousel from '@components/atoms/Carousel/Carousel';
import Consent from '@components/molecules/Consent/Consent';
import Wallets from '@components/molecules/Wallets/Wallets';
import styled from '@emotion/styled';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import { NextPage } from 'next';
import React, { useContext, useEffect } from 'react';

const OnboardingContainer = styled.section`
  display: flex;
  border-radius: 26px;
  box-shadow: 0 10px 20px -15px rgba(56, 56, 56, 0.6);
  max-width: 1200px;
  font-weight: medium;
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

const MemberWalletPage: NextPage = () => {
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

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-2xl px-9 py-10 text-center">
      <div>
        <h1 className="font-medium mb-4">Hey Satoshi</h1>
        <p className="text-sm text-neutral-500">
          We're glad to have you onboard.
          <br />
          If you wish to add a wallet to your account, please select one of the options below.
        </p>
      </div>
      <div className="panel max-w-lg">
        <Wallets wallets={wallets} />
        <div className="my-5 text-xs text-neutral-600 font-medium border-t border-b border-gray-200 py-5">
          <button type="button" className="primary">
            No thanks, I'll stick to email
          </button>
        </div>
        <Consent />
      </div>
    </div>
  );
};

export default MemberWalletPage;
