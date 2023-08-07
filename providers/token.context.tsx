import TokenApiService from '@api-services/TokenApiService';
import ERC20 from '@contracts/abi/ERC20.json';
import { useAuth } from '@store/useAuth';
import { useOrganization } from '@store/useOrganizations';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchTokensByQuery } from 'services/db/token';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

import { useAuthContext } from './auth.context';

export interface IMintFormState {
  name: string;
  symbol: string;
  logo: string;
  address: string;
  supplyCap: 'UNLIMITED' | 'LIMITED';
  decimals: number;
  maxSupply: number | '';
  totalSupply: number | '';
  imported: boolean;
  createdAt: number;
  updatedAt: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  chainId: number;
  burnable?: boolean;
  burntAmount?: number;
}

interface ITokenContextData {
  mintFormState: IToken;
  tokenId: string;
  isTokenLoading: boolean;
  updateMintFormState: (v: any) => void;
  updateTokenId: (v: string) => void;
}

const INITIAL_STATE: IToken = {
  name: '',
  symbol: '',
  logo: '',
  maxSupply: '',
  address: '',
  chainId: 0
};

const TokenContext = createContext({} as ITokenContextData);

export function TokenContextProvider({ children }: any) {
  const { userId, accessToken } = useAuth();
  const { organizationId } = useOrganization();
  const { chainId } = useWeb3React();

  const [isTokenLoading, setIsTokenLoading] = useState(true);

  const [mintFormState, setMintFormState] = useState<IToken>(INITIAL_STATE);

  const [tokenId, setTokenId] = useState('');

  const value = useMemo(
    () => ({
      mintFormState,
      tokenId,
      isTokenLoading,
      updateMintFormState: setMintFormState,
      updateTokenId: setTokenId
    }),
    [mintFormState, isTokenLoading]
  );

  const getTokenDetailsFromBlockchain = async () => {
    if (mintFormState.address && SupportedChains[chainId as SupportedChainId]) {
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

        setMintFormState({
          ...mintFormState,
          name,
          symbol
        });
      }
    }
  };

  // useEffect(() => {
  //   console.log('Mint supply was updated', mintFormState);
  //   // Consider the data from DB as Imported token when this condition is met.
  //   if (
  //     mintFormState.address &&
  //     (!mintFormState.totalSupply || !mintFormState.maxSupply) &&
  //     mintFormState.supplyCap === 'UNLIMITED'
  //   ) {
  //     getTokenDetailsFromBlockchain();
  //   }
  // }, [mintFormState.address]);
  useEffect(() => {
    if (chainId && organizationId && accessToken) {
      TokenApiService.getTokens().then((res) => {
        const data = res.filter((token) => token.chainId === chainId);
        if (data && data.length > 0) {
          setMintFormState(data[0]);
        }
      });
    }
  }, [chainId, organizationId, accessToken]);

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export const useTokenContext = () => ({
  ...useContext(TokenContext)
});
