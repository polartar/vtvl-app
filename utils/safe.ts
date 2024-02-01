import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

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

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
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
