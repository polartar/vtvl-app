import { useWeb3React } from '@web3-react/core';
import { useRouter } from 'next/router';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import useEagerConnect from '../hooks/useEagerConnect';

interface OnboardingInfo {
  isFirstTimeUser?: boolean;
  userId?: string;
  accountType?: string;
  accountId?: string;
  skipSafe?: boolean;
  safeId?: string;
}

export type OnboardingContextData = {
  info: OnboardingInfo | undefined;
  onPrevious: () => void;
  setInfo: (info: OnboardingInfo) => void;
  onNext: (info: OnboardingInfo) => void;
  setCurrentStep: (step: Step) => void;
  completeOnboarding: () => void;
  inProgress: boolean;
  loading: boolean;
  error: string;
};

const OnboardingContext = createContext({} as OnboardingContextData);

export enum Step {
  ChainSetup = 1,
  Login = 2,
  UserTypeSetup = 3,
  AccountSetup = 4,
  SafeSetup = 5
}

export const States = {
  [Step.ChainSetup]: {
    route: '/onboarding',
    error: 'Please login with web3 wallet to continue'
  },
  [Step.Login]: {
    route: '/member-login',
    error: 'Please login to continue'
  },
  [Step.UserTypeSetup]: {
    route: '/onboarding/select-user-type',
    error: 'Please configure your account to continue'
  },
  [Step.AccountSetup]: {
    route: '/onboarding/account-setup',
    error: 'Please setup your account to continue'
  },
  [Step.SafeSetup]: {
    route: '/onboarding/setup-safes',
    error: 'Please setup your safe id if you are not skipping'
  }
};

export function OnboardingContextProvider({ children }: any) {
  const triedToEagerConnect = useEagerConnect();
  const { account, library } = useWeb3React();
  const [info, setInfo] = useState<OnboardingInfo | undefined>();
  const [currentStep, setCurrentStep] = useState<Step>(Step.ChainSetup);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('onboarding contest current step is ', currentStep);
    console.log('onboarding in progress ?? ', inProgress);
    router.beforePopState(({ as }) => {
      if (as !== router.asPath && inProgress) {
        onPrevious();
      }
      return true;
    });
  }, [router]);

  const completeOnboarding = () => {
    setInProgress(false);
    router.replace('/dashboard');
  };

  const onPrevious = () => {
    if (!currentStep) throw new Error('invalid route onboarding context');
    const prevstep = currentStep == Step.ChainSetup ? currentStep : currentStep - 1;
    if (!States[prevstep as Step].route) throw new Error('invalid route onboarding context');
    if (!States[prevstep as Step].route) return;
    setCurrentStep(prevstep);
    router.replace(States[prevstep as Step].route);
  };

  const setRoute = async (isFirstTimeUser?: boolean) => {
    const nextstep = Number(currentStep) + 1;
    console.log('current step is ', Number(currentStep));
    console.log('onboarding context nextstep == ', nextstep);

    if (!States[nextstep as Step].route || !currentStep) throw new Error('invalid route onboarding context');
    console.log('onboarding context valid route');
    setCurrentStep(nextstep);

    if (currentStep === Step.ChainSetup) setInProgress(true);

    if (nextstep == Step.UserTypeSetup) {
      console.log('is this a first time user -- contest -- ', isFirstTimeUser);
      await router.push(isFirstTimeUser ? States[nextstep as Step].route : '/dashboard');
      return;
    }

    // if (nextstep == Step.SafeSetup){
    //   console.log("onboarding context setting up safe")
    //   if (!account) throw new Error('Please login with metamask to proceed');
    //   const resp = await fetchSafes(library, account);
    //   await router.push(resp?.safes && resp?.safes.length > 0 ?  '/onboarding/import-safes' : States[nextstep as Step].route)
    //   return
    // }

    if (nextstep > Step.SafeSetup) {
      console.log('onboarding context ending onboarding');
      setInProgress(false);
      await router.push('/dashboard');
      return;
    }
    console.log('onboarding context valid route aboutt to replace route ', States[nextstep as Step].route);
    await router.push(States[nextstep as Step].route);
  };

  const onNext = async (data: OnboardingInfo) => {
    console.log('currentStep is ', currentStep);
    switch (currentStep) {
      case Step.ChainSetup:
        setInProgress(true);
        await setRoute();
        break;

      case Step.Login:
        if (!data.userId || data.isFirstTimeUser == undefined) throw Error(States[currentStep].error);
        setInfo({ ...info, userId: data.userId });
        await setRoute(data.isFirstTimeUser);
        break;

      case Step.UserTypeSetup:
        if (!data.accountType) throw Error(States[currentStep].error);
        setInfo({ ...info, accountType: data.accountType });
        await setRoute();
        break;

      case Step.AccountSetup:
        if (!data.accountId) throw Error(States[currentStep].error);
        setInfo({ ...info, accountId: data.accountId });
        await setRoute();
        break;

      case Step.SafeSetup:
        if (!data.skipSafe && !data.safeId) throw Error(States[currentStep].error);
        setInfo({ ...info, safeId: data.safeId });
        await setRoute();
        break;

      default:
        break;
    }
    console.log('Current INFO state ', info);
  };

  const memoedValue = useMemo(
    () => ({
      info,
      onPrevious,
      onNext,
      setInfo,
      setCurrentStep,
      completeOnboarding,
      loading,
      inProgress,
      error
    }),
    [info, loading, error, currentStep]
  );

  return <OnboardingContext.Provider value={memoedValue}>{children}</OnboardingContext.Provider>;
}

export default OnboardingContext;
