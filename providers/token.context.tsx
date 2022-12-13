import ERC20 from '@contracts/abi/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchTokenByQuery } from 'services/db/token';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

import { useAuthContext } from './auth.context';
import { useSharedContext } from './shared.context';

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
  tokenId: string;
  isTokenLoading: boolean;
  updateMintFormState: (v: any) => void;
}

const TokenContext = createContext({} as ITokenContextData);

export function TokenContextProvider({ children }: any) {
  const { library, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [isTokenLoading, setIsTokenLoading] = useState(true);

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

  const [tokenId, setTokenId] = useState('');

  const value = useMemo(
    () => ({
      mintFormState,
      tokenId,
      isTokenLoading,
      updateMintFormState: setMintFormState
    }),
    [mintFormState, isTokenLoading]
  );

  const getTokenDetailsFromBlockchain = async () => {
    if (organizationId && mintFormState.address && SupportedChains[chainId as SupportedChainId]) {
      // Check blockchain for precise details
      // Rely on tokens collection from DB to have the token address itself
      // Because:
      // - Imported tokens is not guaranteed to have a vestingContract in our DB.
      // - Imported and Platform-created tokens have a tokens document that has the token address.
      const vestingContractInstance = new ethers.Contract(
        mintFormState.address ?? '',
        ERC20,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      if (vestingContractInstance) {
        // Get all necessary details from the blockchain
        const [totalSupply, name, symbol, decimals] = await Promise.all([
          vestingContractInstance.totalSupply(),
          vestingContractInstance.name(),
          vestingContractInstance.symbol(),
          vestingContractInstance.decimals()
        ]);
        // Divide response token unit 256 to 1e18 for 18 decimal places.
        // To do: look for a util function that does this.
        console.log('Token details', name, symbol, decimals, +totalSupply.toString() / 1e18, vestingContractInstance);

        setMintFormState({
          ...mintFormState,
          initialSupply: +totalSupply.toString() / 1e18,
          name,
          symbol,
          decimals
        });
      }
    }
  };

  const fetchToken = () => {
    if (organizationId) {
      fetchTokenByQuery('organizationId', '==', organizationId)
        .then((res) => {
          if (res && res.data) {
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
              updatedAt: res.data?.updatedAt ? res.data?.updatedAt : Math.floor(new Date().getTime() / 1000),
              status: res.data?.status ? res.data?.status : 'PENDING',
              tokenId: res.id
            }));
            setTokenId(res.id);
          }
          setIsTokenLoading(false);
        })
        .catch((err) => {
          setIsTokenLoading(false);
        });
    } else {
      setIsTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [organizationId]);

  useEffect(() => {
    console.log('Mint supply was updated', mintFormState);
    // Consider the data from DB as Imported token when this condition is met.
    if (
      mintFormState.address &&
      (!mintFormState.initialSupply || !mintFormState.maxSupply) &&
      mintFormState.supplyCap === 'UNLIMITED'
    ) {
      getTokenDetailsFromBlockchain();
    }
  }, [mintFormState.address]);

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export const useTokenContext = () => ({
  ...useContext(TokenContext)
});
