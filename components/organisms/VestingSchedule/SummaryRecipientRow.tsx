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
import format from 'date-fns/format';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createRevoking, fetchRevokingsByQuery } from 'services/db/revoking';
import { createTransaction, fetchTransaction } from 'services/db/transaction';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipientDoc, IRevoking, ITransaction, IVesting } from 'types/models';
import { REVOKE_CLAIM_FUNCTION_ABI } from 'utils/constants';
import { createSafeTransaction } from 'utils/safe';

interface ISummaryRecipientRowProps {
  recipient: IRecipientDoc;
}

const SummaryRecipientRow: React.FC<ISummaryRecipientRowProps> = ({ recipient }) => {
  const { chainId, library } = useWeb3React();
  const { safe } = useAuthContext();

  const [revoking, setRevoking] = useState<{ id: string; data: IRevoking }>();
  const [transaction, setTransaction] = useState<ITransaction>();
  const [confirmations, setConfirmations] = useState(0);
  const [threshold, setThreshold] = useState(0);

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (safe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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

  useEffect(() => {
    if (chainId) {
      fetchRevokingsByQuery(
        ['chainId', 'recipient', 'vestingId'],
        ['==', '==', '=='],
        [chainId, recipient.data.walletAddress, recipient.data.vestingId]
      ).then((res) => {
        if (res && res.length > 0) {
          const revoke = res[0];

          setRevoking(revoke);
          if (revoke && revoke.data.status === 'PENDING' && revoke.data.transactionId) {
            fetchTransaction(revoke.data.transactionId).then((res) => setTransaction(res));
          }
        }
      });
    }
  }, [chainId, recipient]);

  useEffect(() => {
    if (transaction && transaction.safeHash) {
      fetchSafeTransactionFromHash(transaction.safeHash);
    }
  }, [transaction]);

  return (
    <div className="flex text-[#667085] text-xs border-2">
      <div className="flex items-center w-36 p-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {recipient.data.name}
      </div>
      <div className="flex items-center w-36 p-3 flex-shrink-0 bg-[#f9fafb] border-t border-[#d0d5dd]">
        {revoking ? (
          <Chip rounded label="Revoking" color="dangerAlt" />
        ) : (
          <Chip rounded label="Active" color="success" />
        )}
      </div>

      <div className="flex items-center w-36 p-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {revoking && revoking?.data.updatedAt && format(new Date(revoking?.data.updatedAt * 1000), 'dd/MM/yyyy')}
      </div>
      <div className="flex items-center w-full  p-3  border-t border-[#d0d5dd] bg-[#f9fafb]">
        <StepWizard status={confirmations} steps={new Array(threshold).fill({ title: '', desc: '' })} size="tiny" />
      </div>
    </div>
  );
};

export default SummaryRecipientRow;
