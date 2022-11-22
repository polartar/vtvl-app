import Carousel from '@components/atoms/Carousel/Carousel';
import Consent from '@components/molecules/Consent/Consent';
import Wallets from '@components/molecules/Wallets/Wallets';
import styled from '@emotion/styled';
import OnboardingContext, { Step, useOnboardingContext } from '@providers/onboarding.context';
import { NextPage } from 'next';
import Router from 'next/router';
import AstroHelmet from 'public/icons/astronaut-helmet.svg';
import { useContext, useEffect } from 'react';

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
  background-color: #202b8b;
  background: url('/images/background.png'), linear-gradient(0deg, #e65e43 -40%, #202b8b 70%, #202b8b 100%);
  background-size: cover;
`;

const WalletContainer = styled.div`
  width: 100%;
`;

const SelectLoginTypePage: NextPage = () => {
  const { startOnboarding } = useOnboardingContext();
  useEffect(() => {
    startOnboarding(Step.ChainSetup);
  }, []);

  const wallets = [
    {
      name: 'Member',
      image: <AstroHelmet className="w-10 h-10 text-primary-900 mb-3" />,
      // Change this based on where the flow it should be
      onClick: () => Router.push('/onboarding/connect-wallet')
    },
    {
      name: 'Guest',
      image: <AstroHelmet className="w-10 h-10 text-secondary-900 mb-3" />,
      // Change this based on where the flow it should be
      onClick: () => Router.push('/onboarding/connect-wallet')
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
          <h1 className="font-medium">Access VTVL as</h1>
          <p className="text-sm font-medium text-neutral-500">
            Select <strong>Member</strong> if you&apos;re an existing user or signing up, else select{' '}
            <strong>Guest</strong> to test our platform.
          </p>
        </div>
        <WalletContainer>
          <div className="max-w-sm mx-auto mb-11">
            <Wallets wallets={wallets} />
          </div>
        </WalletContainer>
      </Signing>
      <Vesting className="flex flex-col items-center justify-center pt-12 pb-10">
        <Carousel variant="dark" items={carouselItems} />
      </Vesting>
    </OnboardingContainer>
  );
};

export default SelectLoginTypePage;
