import Chip from '@components/atoms/Chip/Chip';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useWeb3React } from '@web3-react/core';
import format from 'date-fns/format';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { fetchRevokingsByQuery } from 'services/db/revoking';
import { fetchTransaction } from 'services/db/transaction';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipient, IRevoking, ITransaction } from 'types/models';

interface ISummaryRecipientRowProps {
  recipient: IRecipient;
}

const SummaryRecipientRow: React.FC<ISummaryRecipientRowProps> = ({ recipient }) => {
  const { chainId, library } = useWeb3React();
  const { currentSafe } = useAuthContext();

  const [revoking, setRevoking] = useState<{ id: string; data: IRevoking }>();
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
    if (chainId) {
      fetchRevokingsByQuery(
        ['chainId', 'recipient', 'vestingId'],
        ['==', '==', '=='],
        [chainId, recipient.address, recipient.vestingId]
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
        {revoking && revoking?.data.updatedAt && format(new Date(revoking?.data.updatedAt * 1000), 'dd/MM/yyyy')}
      </div>
      <div className="flex items-center w-full  p-3  border-t border-[#d0d5dd] bg-[#f9fafb]">
        <StepWizard status={confirmations} steps={new Array(threshold).fill({ title: '', desc: '' })} size="tiny" />
      </div>
    </div>
  );
};

export default SummaryRecipientRow;
