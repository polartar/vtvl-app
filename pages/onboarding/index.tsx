import styled from '@emotion/styled';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

import Carousel from '../../components/atoms/Carousel/Carousel';
import Chip from '../../components/atoms/Chip/Chip';
import WalletButton from '../../components/atoms/WalletButton/WalletButton';
import MultiSigWallet from '../../components/multisig';
import { injected, walletconnect } from '../../connectors';

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

const Text = styled.span`
  font-size: 0.75rem;
`;

const Link = styled.a`
  font-size: 0.75rem;
  font-weight: bold;
  color: #1b369a;
  text-decoration: none;
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

const Wallets = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

interface Wallet {
  name: string;
  image: string;
  subLabel?: unknown;
  disabled?: boolean;
  onClick?: () => void;
}

const ConnectWalletPage: NextPage = () => {
  const { active, activate, account, deactivate } = useWeb3React();
  const [wallet, setWallet] = React.useState('');
  const router = useRouter();

  function metamaskActivate() {
    activate(injected, (err) => console.log('error connecting ', err));
    router.push('/onboarding/select-user-type');
  }

  function walletConnectActivate() {
    activate(walletconnect, (err) => console.log('error connecting ', err));
    router.push('/onboarding/select-user-type');
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

  const renderWallets = (wallets: Array<Wallet>) => {
    return wallets.map((wallet: Wallet, walletIndex: number) => (
      <WalletButton
        key={`wallet-button-${wallet.name}-${walletIndex}`}
        label={wallet.name}
        image={wallet.image}
        subLabel={
          wallet.subLabel ? <Chip size="small" color="primary" rounded={true} label={wallet.subLabel as string} /> : ''
        }
        disabled={wallet.disabled}
        onClick={wallet.onClick}
      />
    ));
  };
  return (
    <OnboardingContainer>
      <Signing>
        <div>
          <h1 className="font-medium">Connect to your wallet</h1>
          <p className="text-sm text-neutral-500">Please select a wallet to connect to this app</p>
        </div>
        <WalletContainer>
          <Wallets>{renderWallets(wallets)}</Wallets>
          <div className="my-5 text-xs text-neutral-600 font-medium">
            <span>Can&apos;t find your wallet?</span>&nbsp;
            <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
              Suggest Wallet
            </a>
          </div>
          <div className="text-xs text-neutral-600 font-medium leading-5">
            <Text>
              By connecting a wallet, you agree to VTVL{' '}
              <Link href="/" className="font-bold text-primary-900 no-underline">
                Terms of Service
              </Link>{' '}
              and acknowledge that you have read and understand the{' '}
              <Link href="/" className="font-bold text-primary-900 no-underline">
                Privacy Policy
              </Link>
              .
            </Text>
          </div>
        </WalletContainer>
      </Signing>
      <Vesting className="flex flex-col items-center justify-start pt-24 pb-14">
        <Carousel variant="dark" items={carouselItems} />
      </Vesting>
    </OnboardingContainer>
  );
};

export default ConnectWalletPage;
