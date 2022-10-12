
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3React } from '@web3-react/core';
import { fetchSafes } from 'services/gnosois';

  interface OnboardingInfo {
    address?: string,
    chainId?: number,
    userId?: string,
    accountType?: string,
    accountId?: string,
    skipSafe?: boolean,
    safeId?: string,
  }

  export type OnboardingContextData = {
    info: OnboardingInfo | undefined;
    onPrevious: () => void;
    onNext: () => void;
    setInfo: (info: OnboardingInfo) => void;
    onCompleteStep: (info: OnboardingInfo) => void;
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
    SafeSetup = 5,
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
      route: '/onboarding/new-safe',

    },
  }

  const initialStep = Step.ChainSetup;

  export function OnboardingContextProvider({ children }: any) {
    const [info, setInfo] = useState<OnboardingInfo | undefined>();
    const [currentStep, setCurrentStep] = useState<Step>(initialStep);
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const router = useRouter()
    const { account, library } = useWeb3React();


    useEffect(() => {

    }, []);


    const onPrevious = () => {
      const prevstep = currentStep == Step.ChainSetup ? currentStep: currentStep - 1;
      console.log("what is this ", States[prevstep as Step])
      if (!States[prevstep as Step].route) return;
      setCurrentStep(prevstep)
      router.replace(States[prevstep as Step].route);
    }

    const onNext = async () => {
      const nextstep = currentStep != Step.SafeSetup ? currentStep + 1: currentStep;
      if (!States[nextstep as Step].route) return;
      setCurrentStep(nextstep);

      if (nextstep == Step.SafeSetup){
        if (!account) throw new Error('Please login with metamask to proceed');
        const resp = await fetchSafes(library, account);
        resp?.safes && resp?.safes.length > 0 ?  router.replace('/onboarding/import-safes') :  router.replace(States[nextstep as Step].route)
      }

      if (nextstep > Step.SafeSetup){
        setInProgress(false)
        router.push('/dashboard')
      }

      router.replace(States[nextstep as Step].route)
    }

    const onCompleteStep = async ( data : OnboardingInfo) => {
      switch (currentStep) {

        case Step.ChainSetup:
          if(!data.chainId || !data.address) throw Error("incomplete step")
          setInfo({...info, chainId: data.chainId, address: data.address})
          setInProgress(true)
          await onNext()
          break;

        case Step.Login:
          if(!data.userId) throw Error("incomplete step")
          setInfo({...info, userId: data.userId})
          await onNext();
          break;

        case Step.UserTypeSetup:
          if(!data.accountType) throw Error("incomplete step");
          setInfo({...info, accountType: data.accountType});
          await onNext();
          break;

        case Step.AccountSetup:
          if(!data.accountId) throw Error("incomplete step")
          setInfo({...info, accountId: data.accountId})
          await onNext();
          break;

        case Step.SafeSetup:
          if(!data.skipSafe && !data.safeId) throw Error("incomplete step")
          setInfo({...info, safeId: data.safeId});
          await onNext();
          break;

        default:
          break;
      }
      console.log("Current INFO state ", info)
    }

    const memoedValue = useMemo(
      () => ({
        info,
        onPrevious,
        onNext,
        setInfo,
        onCompleteStep,
        loading,
        inProgress,
        error
      }),
      [info, loading, error]
    );

    return <OnboardingContext.Provider value={memoedValue}>{children}</OnboardingContext.Provider>;
  }

  export default OnboardingContext;
