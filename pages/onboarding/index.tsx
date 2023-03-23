import Carousel from '@components/atoms/Carousel/Carousel';
import Wallets from '@components/molecules/Wallets/Wallets';
import PaddedLayout from '@components/organisms/Layout/PaddedLayout';
import styled from '@emotion/styled';
import { useGlobalContext } from '@providers/global.context';
import { Step, useOnboardingContext } from '@providers/onboarding.context';
import { NextPage } from 'next';
import Router from 'next/router';
import AstroHelmet from 'public/icons/astronaut-helmet.svg';
import { useEffect, useState } from 'react';
import { WEBSITE_NAME } from 'utils/constants';

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
  padding: 279px 74px;
  border: 1px solid #d0d5dd;
  border-right: none;
  border-radius: 26px 0 0 26px;
`;

const Vesting = styled.div<{ background?: string }>`
  border-radius: 0 26px 26px 0;
  background-color: var(--primary-900);
  background: url('${({ background }) => background ?? '/images/background.png'}'),
    linear-gradient(0deg, var(--secondary-900) -40%, var(--primary-900) 70%, var(--primary-900) 100%);
  background-size: cover;
`;

const WalletContainer = styled.div`
  width: 100%;
`;

const SelectLoginTypePage: NextPage = () => {
  const { startOnboarding } = useOnboardingContext();
  const {
    website: { assets, name, organizationId: webOrgId }
  } = useGlobalContext();

  const [wallets, setWallets] = useState([
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
  ]);

  useEffect(() => {
    startOnboarding(Step.ChainSetup);
  }, []);

  useEffect(() => {
    if (webOrgId) {
      setWallets([...wallets.slice(0, 1)]);
    }
  }, [webOrgId]);

  return (
    <PaddedLayout>
      <OnboardingContainer>
        <Signing>
          <div className="max-w-[397px]">
            <h1 className="font-medium">Access {name || WEBSITE_NAME} as</h1>
            <p className="text-sm font-medium text-neutral-500">
              Select <strong>Member</strong> if you&apos;re an existing user or signing up
              {webOrgId ? (
                '.'
              ) : (
                <>
                  , else select <strong>Guest</strong> to test our platform.
                </>
              )}
            </p>
          </div>
          <WalletContainer>
            <div className="max-w-sm mx-auto mb-11">
              <Wallets wallets={wallets} />
            </div>
          </WalletContainer>
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

export default SelectLoginTypePage;
