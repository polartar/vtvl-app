import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { OwnerResponse } from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

export const getSafeInfo = async (provider: any, safeAddress: string): Promise<Safe | undefined> => {
  if (!provider || !safeAddress) return;

  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signerOrProvider: provider?.getSigner(0)
  });

  const safe: Safe = await Safe.create({ ethAdapter, safeAddress });
  return safe;
};

export const fetchSafes = async (
  provider: any,
  address: string,
  chainId: SupportedChainId
): Promise<OwnerResponse | undefined> => {
  if (!provider || !address) return;
  if (!SupportedChains[chainId].multisigTxUrl) throw new Error('Multisig is not supported on this chain.');

  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signerOrProvider: provider.getSigner(0)
  });

  const safeService = new SafeServiceClient({
    txServiceUrl: SupportedChains[chainId].multisigTxUrl,
    ethAdapter
  });

  const safes: OwnerResponse = await safeService.getSafesByOwner(address);
  return safes;
};

export const deploySafe = async (provider: any, owners: string[], threshold: number): Promise<Safe> => {
  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signerOrProvider: provider.getSigner(0)
  });

  const safeFactory = await SafeFactory.create({ ethAdapter });
  const safeAccountConfig: SafeAccountConfig = {
    owners,
    threshold
  };

  const newSafe: Safe = await safeFactory.deploySafe({ safeAccountConfig });
  return newSafe;
};
