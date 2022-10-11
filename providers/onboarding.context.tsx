
  import React, { createContext, useEffect, useMemo, useState } from 'react';
  import { ethers } from 'ethers';
  import { useWeb3React } from '@web3-react/core';
  import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
  import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
  import SafeServiceClient, { OwnerResponse } from '@gnosis.pm/safe-service-client'

  interface OnboardingInfo {

  }

  export type OnboardingContextData = {
    info: OnboardingInfo | undefined;
    safe: Safe | undefined;
    safes: string[] | undefined;
    createSafe: (owners: string[], threshold: number) => Promise<void>;
    fetchSafes: () => Promise<OwnerResponse | undefined>;
    // signInWithGoogle: () => Promise<void>;
    // anonymousSignIn: () => Promise<void>;
    loading: boolean;
    error: string;
  };

  const OnboardingContext = createContext({} as OnboardingContextData);

  export function OnboardingContextProvider({ children }: any) {
    const { library, account, active } = useWeb3React();
    const [safe, setSafe] = useState<Safe>();
    const [safes, setSafes] = useState<string[]>();
    const [info, setInfo] = useState<OnboardingInfo | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');

    const setupSafes = async () => {
        const s = await fetchSafes();
        setSafes(s?.safes);
    }

    useEffect(() => {
        if(active) {
            setupSafes();
        }
    }, [active]);

    const createSafe = async (owners: string[], threshold: number) => {
        if(!active) return;

        const ethAdapter = new EthersAdapter({
            ethers: ethers,
            signer: library?.getSigner(0)
        });

        const safeFactory = await SafeFactory.create({ ethAdapter });
        // const owners = ['0xF6F193B066039DE07df05bb31Afe36524C15fd5F', '0x82B647063A076d08c862058c2c114ac20d522653'];
        // const threshold = 2;
        const safeAccountConfig: SafeAccountConfig = {
          owners,
          threshold
          // ...
        };

        const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
        setSafe(safeSdk)
    }

    const fetchSafes = async (): Promise<OwnerResponse | undefined> => {
        if(!active) return;

        const ethAdapter = new EthersAdapter({
            ethers: ethers,
            signer: library?.getSigner(0)
        });

        const safeService = new SafeServiceClient({
            txServiceUrl: 'https://safe-transaction.gnosis.io',
            ethAdapter
        });
        if(account) {
            const safes: OwnerResponse = await safeService.getSafesByOwner(account)
            return safes
        }
    }

    const memoedValue = useMemo(
      () => ({
        info,
        safe,
        safes,
        createSafe,
        fetchSafes,
        loading,
        error
      }),
      [info, loading, error]
    );

    return <OnboardingContext.Provider value={memoedValue}>{children}</OnboardingContext.Provider>;
  }

  export default OnboardingContext;
