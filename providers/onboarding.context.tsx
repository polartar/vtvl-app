
import React, { createContext, useEffect, useMemo, useState } from 'react';
import Safe from '@gnosis.pm/safe-core-sdk';
import { useRouter } from 'next/router';

  interface OnboardingInfo {
    address: string,
    chainId: number,
    accountType: string,
    accountId: string,
    skipSafe: boolean,
    safe: Safe,
  }

  export type OnboardingContextData = {
    info: OnboardingInfo | undefined;
    onPrevious: () => void;
    onNext: () => void;
    setInfo: (info: OnboardingInfo) => void;
    setCurrentStep: (step: Step) => void;
    loading: boolean;
    error: string;
  };

  const OnboardingContext = createContext({} as OnboardingContextData);

  export enum Step {
    ChainSetup = 1,
    UserTypeSetup = 2,
    AccountSetup = 3,
    SafeSetup = 4,
  }

  export const States = {
    [Step.ChainSetup]: {
      route: '/onboarding',
    },
    [Step.UserTypeSetup]: {
      route: '/onboarding/select-user-type',
    },
    [Step.AccountSetup]: {
      route: '/onboarding/account-setup',
    },
    [Step.SafeSetup]: {
      route: '/onboarding/multisig-setup',
    },
  }
  const initialStep = Step.ChainSetup;

  export function OnboardingContextProvider({ children }: any) {
    const [info, setInfo] = useState<OnboardingInfo | undefined>();
    const [currentStep, setCurrentStep] = useState<Step>(initialStep);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const router = useRouter();


    useEffect(() => {

    }, []);

    const onPrevious = () => {
      setCurrentStep(currentStep-1)
      router.replace(States[currentStep].route);
    }

    const onNext = () => {
      setCurrentStep(currentStep+1)
      router.replace(States[currentStep].route);
    }



    const memoedValue = useMemo(
      () => ({
        info,
        onPrevious,
        onNext,
        setInfo,
        setCurrentStep,
        loading,
        error
      }),
      [info, loading, error]
    );

    return <OnboardingContext.Provider value={memoedValue}>{children}</OnboardingContext.Provider>;
  }

  export default OnboardingContext;
