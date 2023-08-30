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
    website: { assets, name, organizationId: webOrgId, features }
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
    if (webOrgId && features?.auth?.memberOnly) {
      setWallets([...wallets.slice(0, 1)]);
    }
  }, [webOrgId, features]);

  return (
    <PaddedLayout>
      <div className="grid md:grid-cols-2 md:rounded-3xl md:shadow-xl max-w-[1152px]">
        <div className="flex flex-col justify-center items-center gap-8 py-24 px-8 order-1 md:order-0 md:py-[279px] md:px-[74px]">
          <div className="max-w-[397px] text-center md:text-left">
            <h1 className="font-medium">Access {name || WEBSITE_NAME} as</h1>
            {!features?.auth?.memberOnly && (
              <p className="text-sm font-medium text-neutral-500">
                Select <strong>Member</strong> if you&apos;re an existing user or signing up, else select{' '}
                <strong>Guest</strong> to test our platform.
              </p>
            )}
          </div>
          <WalletContainer>
            <div className="max-w-sm mx-auto mb-11">
              <Wallets wallets={wallets} />
            </div>
          </WalletContainer>
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

export default SelectLoginTypePage;
