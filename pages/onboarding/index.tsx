import { NextPage } from 'next';
import Router from 'next/router';
import { useEffect } from 'react';

const SelectLoginTypePage: NextPage = () => {
  useEffect(() => {
    Router.push('/onboarding/sign-up');
    // startOnboarding(Step.ChainSetup);
  }, []);

  return <></>;
};

export default SelectLoginTypePage;
