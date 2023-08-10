import ERC20 from '@contracts/abi/ERC20.json';
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
  initialSupply: number | '';
  imported: boolean;
  createdAt: number;
  updatedAt: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  chainId: number;
  burnable?: boolean;
  burntAmount?: number;
}

interface ITokenContextData {
  mintFormState: IMintFormState;
  tokenId: string;
  isTokenLoading: boolean;
  updateMintFormState: (v: any) => void;
  updateTokenId: (v: string) => void;
}

const INITIAL_STATE: IMintFormState = {
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
  status: 'PENDING',
  chainId: 0,
  burnable: false,
  burntAmount: 0
};

const TokenContext = createContext({} as ITokenContextData);

export function TokenContextProvider({ children }: any) {
  const { chainId } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [isTokenLoading, setIsTokenLoading] = useState(true);

  const [mintFormState, setMintFormState] = useState<IMintFormState>(INITIAL_STATE);

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

  const fetchToken = async () => {
    if (organizationId && chainId) {
      fetchTokensByQuery(['organizationId', 'chainId'], ['==', '=='], [organizationId, chainId])
        .then((res) => {
          if (res) {
            const token = res.find((token) => {
              const data = token.data();
              if (data && data.chainId) {
                return data.chainId === chainId;
              }
              return false;
            });
            if (token && token.data()) {
              const data = token.data();
              setMintFormState((mintFormState) => ({
                ...mintFormState,
                address: data.address ? ethers.utils.getAddress(data.address) : '',
                name: data.name || '',
                symbol: data.symbol || '',
                logo: data.logo || '',
                supplyCap: data.supplyCap || ('UNLIMITED' as any),
                maxSupply: data && data.maxSupply ? data.maxSupply : 0,
                initialSupply: data && data.initialSupply ? data.initialSupply : 0,
                decimals: 18,
                imported: data?.imported || false,
                createdAt: data?.createdAt ? data?.createdAt : Math.floor(new Date().getTime() / 1000),
                updatedAt: data?.updatedAt ? data?.updatedAt : Math.floor(new Date().getTime() / 1000),
                status: data?.status ? data?.status : 'PENDING',
                tokenId: token.id,
                chainId: data?.chainId || 0,
                burnable: data.burnable || false,
                burntAmount: data.burntAmount || 0
              }));
              setTokenId(token.id);
            } else {
              setMintFormState((prevState) => ({ ...INITIAL_STATE }));
            }
            setIsTokenLoading(false);
            return false;
          } else {
            setMintFormState((prevState) => ({ ...INITIAL_STATE }));
            setIsTokenLoading(false);
          }
        })
        .catch((err) => {
          setMintFormState((prevState) => ({ ...INITIAL_STATE }));
          setIsTokenLoading(false);
        });
    } else {
      setMintFormState((prevState) => ({ ...INITIAL_STATE }));
      setIsTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [organizationId, chainId]);

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
