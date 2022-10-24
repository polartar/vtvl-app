import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '../services/auth/firebase';

export interface IMintFormState {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  supplyCap: 'UNLIMITED' | 'LIMITED';
  mintAmount: number | '';
  decimals: number;
  initialSupply: number | '';
  contractAddress: string;
}

interface IMintContextData {
  mintFormState: IMintFormState;
  updateMintFormState: (v: any) => void;
}

const MintContext = createContext({} as IMintContextData);

export function MintContextProvider({ children }: any) {
  const [mintFormState, setMintFormState] = useState<IMintFormState>({
    tokenName: '',
    tokenSymbol: '',
    tokenLogo: '',
    supplyCap: 'UNLIMITED',
    mintAmount: '',
    initialSupply: '',
    decimals: 18,
    contractAddress: ''
  });

  const value = useMemo(
    () => ({
      mintFormState,
      updateMintFormState: setMintFormState
    }),
    [mintFormState]
  );

  return <MintContext.Provider value={value}>{children}</MintContext.Provider>;
}

export const useMintContext = () => ({
  ...useContext(MintContext)
});
