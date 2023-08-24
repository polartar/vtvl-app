import TransactionApiService from '@api-services/TransactionApiService';
import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ethers } from 'ethers';
import useIsAdmin from 'hooks/useIsAdmin';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createRevoking, fetchRevokingsByQuery } from 'services/db/revoking';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRevoking, IVesting } from 'types/models';
import { REVOKE_CLAIM_FUNCTION_ABI } from 'utils/constants';
import { createSafeTransaction } from 'utils/safe';

interface IRecipientRowProps {
  name: string;
  address: string;
  withdrawn?: string;
  unclaimed?: string;
  locked?: string;
  allocations?: string;
  vesting: IVesting;
  vestingId: string;
}

const RecipientRow: React.FC<IRecipientRowProps> = ({
  name,
  address,
  withdrawn = '',
  unclaimed = '',
  locked = '',
  allocations = '',
  vesting,
  vestingId
}) => {
  const { chainId, library, account } = useWeb3React();
  const { currentSafe, organizationId, currentSafeId, setCurrentSafe } = useAuthContext();
  const { vestingContracts } = useDashboardContext();
  const { setTransactionStatus, setIsCloseAvailable, transactions, updateTransactions } = useTransactionLoaderContext();

  const isAdmin = useIsAdmin(
    currentSafe ? currentSafe.address : account ? account : '',
    vestingContracts.find((v) => v.id === vesting.vestingContractId)
  );

  const [revoking, setRevoking] = useState<{ id: string; data: IRevoking }>();
  const [transaction, setTransaction] = useState<ITransaction>();
  const [confirmations, setConfirmations] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [revoked, setRevoked] = useState(false);

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const thres = await safeSdk.getThreshold();
      setThreshold(thres);
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      setConfirmations(apiTx.confirmations?.length ?? 0);
    }
  };

  const handleRevoke = async () => {
    const signer = library?.getSigner(0);
    const vestingAddress = vestingContracts.find((v) => v.id === vesting.vestingContractId)?.address;
    if (!signer || !account || !chainId || !vestingAddress) return;

    const recipient = address;
    if (vesting.status === 'COMPLETED' || vesting.status === 'LIVE') {
      try {
        setTransactionStatus('PENDING');
        if (currentSafe?.address) {
          if (!isAdmin) {
            toast.error(
              "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
            );
            return;
          }

          const vestingContractInterface = new ethers.utils.Interface([REVOKE_CLAIM_FUNCTION_ABI]);

          setTransactionStatus('IN_PROGRESS');
          const { hash: safeHash, nonce } = await createSafeTransaction(
            signer,
            chainId as SupportedChainId,
            account,
            currentSafe.address,
            currentSafe?.owners?.map((owner) => owner.address) ?? [],
            {
              to: vestingAddress,
              data: vestingContractInterface.encodeFunctionData('revokeClaim', [recipient]),
              value: '0'
            }
          );

          const transaction = await TransactionApiService.createTransaction({
            hash: '',
            safeHash,
            chainId: vesting.chainId,
            organizationId: vesting.organizationId,
            vestingIds: [vestingId],
            to: vestingAddress,
            status: 'PENDING',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            type: 'REVOKE_CLAIM'
          });
          updateTransactions(transaction);
          await createRevoking({
            vestingId: vestingId,
            recipient,
            transactionId: transaction.id,
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            chainId,
            organizationId: organizationId!,
            status: 'PENDING'
          });

          toast.success(`Revoking transaction with nonce ${nonce} has been created successfully.`);
          console.info('Safe Transaction: ', safeHash);
        } else {
          const vestingContractInstance = new ethers.Contract(
            vestingAddress,
            VTVL_VESTING_ABI.abi,
            library.getSigner()
          );
          const revokeTransaction = await vestingContractInstance.revokeClaim(recipient);
          setTransactionStatus('IN_PROGRESS');
          await revokeTransaction.wait();
          const transaction = await TransactionApiService.createTransaction({
            hash: revokeTransaction.hash,
            safeHash: '',
            chainId: vesting.chainId,
            organizationId: vesting.organizationId,
            vestingIds: [vestingId],
            to: vestingAddress,
            status: 'SUCCESS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            type: 'REVOKE_CLAIM'
          });
          updateTransactions(transaction);
          await createRevoking({
            vestingId: vestingId,
            recipient,
            transactionId: transaction.id,
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            chainId,
            organizationId: organizationId!,
            status: 'SUCCESS'
          });
          setRevoked(true);
          toast.success('Revoking is done successfully.');
        }
        setTransactionStatus('SUCCESS');
      } catch (err) {
        console.log('handleRevoke - ', err);
        toast.error('Something went wrong. Try agaiin later.');
        setTransactionStatus('ERROR');
      }
    }
  };

  useEffect(() => {
    if (chainId && vesting.status === 'LIVE') {
      fetchRevokingsByQuery(
        ['chainId', 'recipient', 'vestingId'],
        ['==', '==', '=='],
        [chainId, address, vestingId]
      ).then((res) => {
        if (res && res.length > 0) {
          const revoke = res[0];
          if (revoke.data.status === 'PENDING') {
            setRevoking({ ...res[0] });
          } else if (revoke.data.status === 'SUCCESS') {
            setRevoked(true);
          }
        }
      });
    }
  }, [vestingId, address, chainId, vesting]);

  useEffect(() => {
    if (revoking && revoking.data.status === 'PENDING' && revoking.data.transactionId) {
      setTransaction(transactions.find((t) => t.id === revoking.data.transactionId));
    }
  }, [revoking]);

  useEffect(() => {
    if (transaction && transaction.safeHash) {
      fetchSafeTransactionFromHash(transaction.safeHash);
    }
  }, [transaction]);

  return (
    <div className="flex text-[#667085] text-xs">
      <div className="flex items-center w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">{name}</div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        <Copy text={address}>
          <p className="paragraphy-small ">
            {address.slice(0, 5)}...{address.slice(-4)}
          </p>
        </Copy>
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 bg-[#f9fafb] border-t border-[#d0d5dd]">
        {revoked ? (
          <Chip rounded label="Revoked" color="danger" />
        ) : revoking ? (
          <Chip rounded label="Revoking" color="dangerAlt" />
        ) : vesting.status === 'LIVE' ? (
          <Chip rounded label="Active" color="success" />
        ) : (
          'N/A'
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 bg-[#f9fafb] border-t border-[#d0d5dd]">
        {confirmations > 0 && threshold > 0 && (
          <StepWizard status={confirmations} steps={new Array(threshold).fill({ title: '', desc: '' })} size="tiny" />
        )}
      </div>
      <div className="flex items-center w-28 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {withdrawn}
      </div>
      <div className="flex items-center w-28 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {unclaimed}
      </div>
      <div className="flex items-center w-28 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">{locked}</div>
      <div className="flex items-center w-28 py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {allocations}
      </div>
      <div className="flex items-center min-w-[136px] flex-grow py-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {(!revoking || revoking.data.status === 'PENDING') && vesting.status === 'LIVE' && (
          <Button
            disabled={revoking?.data.status === 'PENDING' || revoked}
            danger
            size="small"
            label="Revoke"
            onClick={handleRevoke}
          />
        )}
      </div>
    </div>
  );
};

export default RecipientRow;
