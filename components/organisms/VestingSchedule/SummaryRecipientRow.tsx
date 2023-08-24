import RevokingApiService from '@api-services/RevokingApiService';
import Chip from '@components/atoms/Chip/Chip';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useOrganization } from '@store/useOrganizations';
import { useWeb3React } from '@web3-react/core';
import format from 'date-fns/format';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipient } from 'types/models';

interface ISummaryRecipientRowProps {
  recipient: IRecipient;
}

const SummaryRecipientRow: React.FC<ISummaryRecipientRowProps> = ({ recipient }) => {
  const { chainId, library } = useWeb3React();
  const { currentSafe } = useAuthContext();
  const { transactions } = useTransactionLoaderContext();
  const { organizationId } = useOrganization();

  const [revoking, setRevoking] = useState<IRevoking>();
  const [transaction, setTransaction] = useState<ITransaction>();
  const [confirmations, setConfirmations] = useState(0);
  const [threshold, setThreshold] = useState(0);

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

  useEffect(() => {
    if (chainId && organizationId) {
      RevokingApiService.getRevokingsByQuery(
        `organizationId=${organizationId}&chainId=${chainId}&vestingId=${recipient.vestingId}&recipeId=${recipient.id}`
      ).then((res) => {
        if (res && res.length > 0) {
          const revoke = res[0];

          setRevoking(revoke);
          if (revoke && revoke.status === 'PENDING' && revoke.transactionId) {
            setTransaction(transactions.find((t) => t.id === revoke.transactionId));
          }
        }
      });
    }
  }, [chainId, recipient, transactions, organizationId]);

  useEffect(() => {
    if (transaction && transaction.safeHash) {
      fetchSafeTransactionFromHash(transaction.safeHash);
    }
  }, [transaction]);

  return (
    <div className="flex text-[#667085] text-xs border-2">
      <div className="flex items-center w-36 p-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {recipient.name}
      </div>
      <div className="flex items-center w-36 p-3 flex-shrink-0 bg-[#f9fafb] border-t border-[#d0d5dd]">
        {revoking ? (
          <Chip rounded label="Revoked" color="dangerAlt" />
        ) : (
          <Chip rounded label="Active" color="success" />
        )}
      </div>

      <div className="flex items-center w-36 p-3 flex-shrink-0 border-t border-[#d0d5dd] bg-[#f9fafb]">
        {revoking && revoking?.updatedAt && format(new Date(revoking?.updatedAt), 'dd/MM/yyyy')}
      </div>
      <div className="flex items-center w-full  p-3  border-t border-[#d0d5dd] bg-[#f9fafb]">
        <StepWizard status={confirmations} steps={new Array(threshold).fill({ title: '', desc: '' })} size="tiny" />
      </div>
    </div>
  );
};

export default SummaryRecipientRow;
