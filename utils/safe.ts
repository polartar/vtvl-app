import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';
import { ISafeResponse } from 'interfaces/safe';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IOwner, ISafe } from 'types/models';

export type SafeTransaction = {
  to: string;
  data: string;
  value: string;
};

export const createSafeTransaction = async (
  signer: any,
  chainId: SupportedChainId,
  fromAddress: string,
  safeAddress: string,
  safeOwners: string[],
  transaction: SafeTransaction
): Promise<{
  hash: string;
  nonce: number;
}> => {
  if (!signer) {
    throw 'Signer is not initialized';
  }

  const isSafeOwner = safeOwners.findIndex((address) => address.toLowerCase() === fromAddress.toLowerCase()) > -1;
  if (!isSafeOwner) {
    throw `${fromAddress} is not the safe owner address`;
  }

  const ethAdapter = new EthersAdapter({ ethers, signer });
  const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress });
  const safeService = new SafeServiceClient({
    txServiceUrl: SupportedChains[chainId].multisigTxUrl,
    ethAdapter
  });
  const nextNonce = await safeService.getNextNonce(safeAddress);

  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: { ...transaction, nonce: nextNonce }
  });
  const txHash = await safeSdk.getTransactionHash(safeTransaction);
  const signature = await safeSdk.signTransactionHash(txHash);

  await safeService.proposeTransaction({
    safeAddress,
    senderAddress: fromAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash: txHash,
    senderSignature: signature.data
  });

  return { hash: txHash, nonce: nextNonce };
};

// This function is used to transform new api Safe response into the firebase Safe model
export const transformSafe: (payload: {
  safe: ISafeResponse;
  organizationId: string;
  organizationName: string;
  userId: string;
}) => ISafe = ({ safe, organizationId, organizationName, userId }) => {
  return {
    id: safe.id,
    user_id: userId,
    safe_name: safe.name,
    org_name: organizationName,
    org_id: organizationId,
    address: ethers.utils.getAddress(safe.address),
    chainId: safe.chainId,
    owners: safe.safeOwners as IOwner[],
    threshold: safe.requiredConfirmations,
    createdAt: safe.createdAt,
    updatedAt: safe.updatedAt
  } as ISafe;
};

export const transformSafes: (payload: {
  safes: ISafeResponse[];
  organizationId: string;
  organizationName: string;
  userId: string;
}) => { id: string; data: ISafe }[] = ({ safes, organizationId, organizationName, userId }) => {
  return safes?.length
    ? safes?.map((safe) => {
        return {
          id: safe.id,
          data: { ...transformSafe({ safe, organizationId, organizationName, userId }) }
        };
      })
    : [];
};
