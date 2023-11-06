import useSafePush from '@hooks/useSafePush';
import { TRoleGroup } from '@utils/routes';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMember } from 'services/db/member';
import { IRole } from 'types/models/settings';
import { boolean } from 'yup';

import AuthContext from './auth.context';
import { useGlobalContext } from './global.context';

interface OnboardingInfo {
  isFirstTimeUser?: boolean;
  userId?: string;
  accountType?: string;
  orgId?: string;
  skipSafe?: boolean;
  safeAddress?: string;
}

export type OnboardingContextData = {
  info: OnboardingInfo | undefined;
  onPrevious: () => void;
  setInfo: (info: OnboardingInfo) => void;
  onNext: (info: OnboardingInfo) => void;
  startOnboarding: (step: Step) => void;
  completeOnboarding: () => void;
  setInProgress: (state: boolean) => void;
  inProgress: boolean;
  loading: boolean;
  error: string;
};

const OnboardingContext = createContext({} as OnboardingContextData);

export enum Step {
  ChainSetup = 1,
  SignUp = 2,
  UserTypeSetup = 3,
  AccountSetup = 4,
  SafeSetup = 5
}

export const States = {
  [Step.ChainSetup]: {
    route: '/onboarding',
    error: 'Please login with web3 wallet to continue'
  },
  [Step.SignUp]: {
    route: '/onboarding/sign-up',
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
  const {
    website: { features }
  } = useGlobalContext();
  const { user, refreshUser, isNewUser } = useContext(AuthContext);
  const [info, setInfo] = useState<OnboardingInfo | undefined>();
  const [currentStep, setCurrentStep] = useState<Step>(Step.ChainSetup);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { safePush } = useSafePush();

  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath && inProgress) {
        const prevstep = currentStep == Step.ChainSetup ? currentStep : currentStep - 1;
        setCurrentStep(prevstep);
      }
      return true;
    });
  }, [router]);

  const startOnboarding = (step: Step) => {
    setInProgress(true);
    setCurrentStep(step);
  };
  const completeOnboarding = async () => {
    const foundingMembers: TRoleGroup = [IRole.FOUNDER, IRole.MANAGER, IRole.OPERATOR];
    setInProgress(false);
    await refreshUser();
    const user = auth.currentUser;
    if (!user) return;
    const memberInfo = await fetchMember(user.uid);
    if (memberInfo?.role) {
      router.replace(!foundingMembers.includes(memberInfo?.role) ? '/claim-portal' : '/dashboard');
    }
  };

  const onPrevious = () => {
    if (!currentStep) throw new Error('invalid route onboarding context');
    const prevstep = currentStep == Step.ChainSetup ? currentStep : currentStep - 1;
    if (!States[prevstep as Step].route) return;
    setCurrentStep(prevstep);
    router.replace(States[prevstep as Step].route);
  };

  // Redirects the user based on the current step
  const setRoute = async (isFirstTimeUser?: boolean, skipSafe?: boolean) => {
    // Gets the next step if any
    const nextstep = Number(currentStep) + 1;

    if (nextstep > Step.SafeSetup) {
      // Ensures that the sidebar will appear
      setInProgress(false);

      if (skipSafe) {
        // Redirects the user to the dashboard when the last step is met
        await safePush('/dashboard');
        return;
      }

      // Redirects the user to the safe success page -- assumes that the user does not skip safe setup
      await safePush('/onboarding/setup-safe-success');
      return;
    }

    // Just continue
    if (currentStep === Step.ChainSetup) setInProgress(true);

    // Complete the onboarding process if the user is a returning one
    if (currentStep === Step.SignUp && !isFirstTimeUser) {
      completeOnboarding();
      return;
    }

    if (!States[nextstep as Step].route || !currentStep) throw new Error('invalid route onboarding context');

    setCurrentStep(nextstep);

    // if the user is a new user, go to the onboarding process continuation
    if (nextstep == Step.UserTypeSetup) {
      await safePush(isFirstTimeUser ? States[nextstep as Step].route : '/dashboard');
      return;
    }

    // if (nextstep == Step.SafeSetup){
    //   console.log("onboarding context setting up safe")
    //   if (!account) throw new Error('Please login with metamask to proceed');
    //   const resp = await fetchSafes(library, account);
    //   await router.replace(resp?.safes && resp?.safes.length > 0 ?  '/onboarding/import-safes' : States[nextstep as Step].route)
    //   return
    // }

    console.log('onboarding context valid route about to replace route ', States[nextstep as Step].route);

    // When the website is set to members-only, users should be redirected to the login page after connecting their wallet.
    if (nextstep === Step.SignUp && features?.auth?.memberOnly) {
      await safePush('/onboarding/member-login');
    } else {
      await safePush(States[nextstep as Step].route);
    }
  };

  // Identifies and manipulates data for each step
  const onNext = async (data: OnboardingInfo) => {
    switch (currentStep) {
      case Step.ChainSetup:
        setInProgress(true);
        await setRoute();
        break;

      case Step.SignUp:
        if (!data.userId || data.isFirstTimeUser == undefined) throw Error(States[currentStep].error);
        setInfo({ ...info, userId: data.userId, isFirstTimeUser: data.isFirstTimeUser });
        await setRoute(data.isFirstTimeUser);
        break;

      case Step.UserTypeSetup:
        if (!data.accountType) throw Error(States[currentStep].error);
        setInfo({ ...info, accountType: data.accountType });
        await setRoute();
        break;

      case Step.AccountSetup:
        //   if (!data.orgId) throw Error(States[currentStep].error);
        setInfo({ ...info, orgId: data.orgId });
        await setRoute();
        break;

      case Step.SafeSetup:
        if (data.skipSafe == false && !data.safeAddress) throw Error(States[currentStep].error);
        setInfo({ ...info, safeAddress: data.safeAddress });
        await setRoute(data.isFirstTimeUser, data.skipSafe);
        break;

      default:
        break;
    }
  };

  const memoedValue = useMemo(
    () => ({
      info,
      onPrevious,
      onNext,
      setInfo,
      startOnboarding,
      completeOnboarding,
      setInProgress,
      loading,
      inProgress,
      error
    }),
    [info, loading, error, currentStep, inProgress]
  );

  return <OnboardingContext.Provider value={memoedValue}>{children}</OnboardingContext.Provider>;
}

export default OnboardingContext;

export const useOnboardingContext = () => ({
  ...useContext(OnboardingContext)
});
