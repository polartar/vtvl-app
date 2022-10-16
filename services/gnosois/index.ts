import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { OwnerResponse } from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';

export const getSafeInfo = async (provider: any, safeAddress: string): Promise<Safe | undefined> => {
  if (!provider || !safeAddress) return;

  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signer: provider?.getSigner(0)
  });

  const safe: Safe = await Safe.create({ ethAdapter, safeAddress });
  return safe;
};

export const fetchSafes = async (provider: any, address: string): Promise<OwnerResponse | undefined> => {
  if (!provider || !address) return;

  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signer: provider.getSigner(0)
  });

  const safeService = new SafeServiceClient({
    txServiceUrl: 'https://safe-transaction.gnosis.io',
    ethAdapter
  });
  const safes: OwnerResponse = await safeService.getSafesByOwner(address);
  return safes;
};

export const deploySafe = async (provider: any, owners: string[], threshold: number): Promise<Safe> => {
  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signer: provider.getSigner(0)
  });

  const safeFactory = await SafeFactory.create({ ethAdapter });
  // const owners = ['0xF6F193B066039DE07df05bb31Afe36524C15fd5F', '0x82B647063A076d08c862058c2c114ac20d522653'];
  // const threshold = 2;
  const safeAccountConfig: SafeAccountConfig = {
    owners,
    threshold
    // ...
  };

  const newSafe: Safe = await safeFactory.deploySafe({ safeAccountConfig });
  return newSafe;
};
