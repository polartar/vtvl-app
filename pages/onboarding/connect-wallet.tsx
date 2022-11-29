import Carousel from '@components/atoms/Carousel/Carousel';
import Consent from '@components/molecules/Consent/Consent';
import Wallets from '@components/molecules/Wallets/Wallets';
import styled from '@emotion/styled';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import Modal, { Styles } from 'react-modal';

const OnboardingContainer = styled.section`
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

const WalletContainer = styled.div`
  width: 100%;
`;

const ConnectWalletPage: NextPage = () => {
  const { active, activate } = useWeb3React();
  const { onNext, startOnboarding, completeOnboarding } = useContext(OnboardingContext);
  const { user, anonymousSignIn } = useContext(AuthContext);
  const [activated, setActivated] = useState(false);
  const [ledgerModalShow, setLedgerModalShow] = useState(false);

  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: '900',
      overflowY: 'auto',
      paddingTop: '3rem',
      paddingBottom: '3rem'
    },
    content: {
      backgroundColor: '#fff',
      position: 'absolute',
      filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      borderRadius: '1.5rem'
    }
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

  async function metamaskActivate() {
    try {
      await activate(injected);
      setActivated(true);
      onNext({});
    } catch (error) {
      console.log('connection error ', error);
    }
  }

  async function walletConnectActivate() {
    try {
      await activate(walletconnect);
      setActivated(true);
      onNext({});
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
      name: 'Ledger Connect',
      image: '/icons/wallets/ledger.png',
      // need to add an onClick handler here
      onClick: () => setLedgerModalShow(true),
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Wallet Connect',
      image: '/icons/wallets/walletconnect.svg',
      onClick: walletConnectActivate,
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Coinbase Wallet',
      image: '/icons/wallets/coinbase.png',
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
          <h1 className="font-medium">Connect your wallet</h1>
          <p className="text-sm text-neutral-500">Please select a wallet to connect to this app</p>
        </div>
        <WalletContainer>
          <div className="max-w-sm mx-auto">
            <Wallets wallets={wallets} />
          </div>
          <div className="mt-9 mb-5 text-xs text-neutral-600 font-medium flex flex-row items-center justify-center gap-10">
            <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
              What is Wallet?
            </a>
            <div>
              <span>Can&apos;t find your wallet?</span>&nbsp;
              <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
                Suggest Wallet
              </a>
            </div>
          </div>
          <Consent />
        </WalletContainer>
      </Signing>
      <Vesting className="flex flex-col items-center justify-center pt-12 pb-10">
        <Carousel variant="dark" items={carouselItems} />
      </Vesting>
      <Modal isOpen={ledgerModalShow} style={modalStyles}>
        Instructions goes here
        <button type="button" onClick={() => setLedgerModalShow(false)}>
          Close
        </button>
      </Modal>
    </OnboardingContainer>
  );
};

export default ConnectWalletPage;
