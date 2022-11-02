import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchTokenByQuery } from 'services/db/token';

import { useAuthContext } from './auth.context';

export interface IMintFormState {
  name: string;
  symbol: string;
  logo: string;
  address: string;
  supplyCap: 'UNLIMITED' | 'LIMITED';
  decimals: number;
  maxSupply: number | '';
  initialSupply: number | '';
  imported: boolean;
  createdAt: number;
  updatedAt: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

interface ITokenContextData {
  mintFormState: IMintFormState;
  updateMintFormState: (v: any) => void;
}

const TokenContext = createContext({} as ITokenContextData);

export function TokenContextProvider({ children }: any) {
  const { organizationId } = useAuthContext();

  const [mintFormState, setMintFormState] = useState<IMintFormState>({
    name: '',
    symbol: '',
    logo: '',
    supplyCap: 'UNLIMITED',
    maxSupply: '',
    initialSupply: '',
    decimals: 18,
    address: '',
    imported: false,
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000),
    status: 'PENDING'
  });

  const value = useMemo(
    () => ({
      mintFormState,
      updateMintFormState: setMintFormState
    }),
    [mintFormState]
  );

  useEffect(() => {
    if (organizationId) {
      fetchTokenByQuery('organizationId', '==', organizationId).then((res) => {
        if (res)
          setMintFormState((mintFormState) => ({
            ...mintFormState,
            name: res.data?.name || '',
            symbol: res.data?.symbol || '',
            logo: res.data?.logo || '',
            supplyCap: res.data?.supplyCap || ('UNLIMITED' as any),
            maxSupply: res.data && res.data.maxSupply ? res.data?.maxSupply : 0,
            initialSupply: res.data && res.data.initialSupply ? res.data?.initialSupply : 0,
            decimals: 18,
            address: res.data?.address || '',
            imported: res.data?.imported || false,
            createdAt: res.data?.createdAt ? res.data?.createdAt : Math.floor(new Date().getTime() / 1000),
            updatedAt: res.data?.updatedAt ? res.data?.createdAt : Math.floor(new Date().getTime() / 1000),
            status: res.data?.status ? res.data?.status : 'PENDING'
          }));
      });
    }
  }, [organizationId]);
  console.log({ organizationId });
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export const useTokenContext = () => ({
  ...useContext(TokenContext)
});