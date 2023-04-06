import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import VestingABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import { useModal } from 'hooks/useModal';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import React, { useCallback } from 'react';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateRecipient } from 'services/db/recipient';
import { fetchRevokingsByQuery } from 'services/db/revoking';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';
import { IRevokingDoc } from 'types/models/revoking';
import { IVestingDoc } from 'types/models/vesting';
import { IVestingContractDoc } from 'types/models/vestingContract';
import { compareAddresses } from 'utils';

import VestingContractCard from '../Cards/VestingContractCard';
import CreateVestingContractModal from '../CreateVestingContractModal';
import ContractsProfile from './VestingContractsProfile';

export default function VestingContracts() {
  const { vestingContracts, vestings: allVestings, recipients: allRecipients } = useDashboardContext();
  const { organizationId, safe } = useAuthContext();
  const { chainId, account, library } = useWeb3React();
  const { mintFormState: token } = useTokenContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});
  const [revokings, setRevokings] = useState<IRevokingDoc[]>();
  const router = useRouter();
  const { mintFormState } = useTokenContext();

  const { setTransactionStatus: setTransactionLoaderStatus } = useTransactionLoaderContext();

  useEffect(() => {
    if (chainId && organizationId) {
      fetchRevokingsByQuery(
        ['chainId', 'organizationId', 'status'],
        ['==', '==', '=='],
        [chainId, organizationId, 'SUCCESS']
      ).then((res) => {
        if (res) {
          setRevokings(res);
        }
      });
    }
  }, [chainId, organizationId]);

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContracts,
    allVestings,
    allRecipients
  );

  const uniqueVestingContracts = useMemo(() => {
    if (revokings && allVestings && allRecipients) {
      const availableRevokings = revokings.filter(
        (revoking) =>
          Number(
            allRecipients.find(
              (recipient) =>
                recipient.data.vestingId === revoking.data.vestingId &&
                recipient.data.walletAddress === revoking.data.recipient
            )?.data.allocations
          ) !== 0
      );
      const uniqueVestingContracts: IVestingContractDoc[] = [];

      availableRevokings.forEach((revoke) => {
        const vesting = allVestings.find((vesting) => vesting.id === revoke.data.vestingId);
        if (!uniqueVestingContracts.map((contract) => contract.id).includes(vesting?.data.vestingContractId || '')) {
          const vestingContract = vestingContracts.find((contract) => contract.id === vesting?.data.vestingContractId);
          if (vestingContract) uniqueVestingContracts.push(vestingContract);
        }
      }, []);

      return uniqueVestingContracts;
    } else {
      return [];
    }
  }, [revokings, allRecipients, allVestings]);

  const getVestingInfoByContract = useCallback(
    (contractAddress: string) => {
      const vestings = vestingSchedulesInfo.filter((vi) => compareAddresses(vi.address, contractAddress));
      let allocation = BigNumber.from(0),
        unclaimed = BigNumber.from(0),
        withdrawn = BigNumber.from(0),
        locked = BigNumber.from(0);
      vestings.forEach((vesting) => {
        allocation = allocation.add(vesting.allocation);
        unclaimed = unclaimed.add(vesting.unclaimed);
        withdrawn = withdrawn.add(vesting.withdrawn);
        locked = locked.add(vesting.locked);
      });

      const vestingContract = vestingContracts.find((contract) =>
        compareAddresses(contract.data.address, contractAddress)
      );

      return {
        address: contractAddress,
        recipient: '',
        allocation: allocation,
        unclaimed: unclaimed,
        withdrawn: withdrawn,
        locked: locked,
        reserved: vestings.length
          ? BigNumber.from(vestingContract?.data.balance || '0').sub(vestings[0].numTokensReservedForVesting || '0')
          : BigNumber.from(0)
      };
    },
    [vestingSchedulesInfo]
  );

  const vestingContractsInfo = useMemo(() => {
    return vestingContracts.map((vestingContract) => getVestingInfoByContract(vestingContract.data.address));
  }, [vestingSchedulesInfo, getVestingInfoByContract, vestingContracts]);

  const initRecipientAllocation = (vestingContractAddress: string) => {
    const vestingContract = vestingContracts.find((contract) => contract.data.address === vestingContractAddress);
    if (!vestingContract) return;
    const vestingIds = allVestings
      .filter((vesting) => vesting.data.vestingContractId === vestingContract.id)
      .map((vesting) => vesting.id);
    const availableRecipients = allRecipients.filter((recipient) => vestingIds.includes(recipient.data.vestingId));

    availableRecipients.forEach((recipient) => {
      updateRecipient(recipient.id, {
        allocations: 0
      });
    });
  };

  const handleTransfer = async (vestingContractAddress: string) => {
    if (vestingContracts && vestingContracts.length > 0 && organizationId && chainId && account) {
      const vestingContract = new ethers.Contract(vestingContractAddress, VestingABI.abi, library.getSigner());
      const vestingContractInfo = vestingContractsInfo.find((contract) => contract.address === vestingContractAddress);
      if (safe?.address) {
        const ADMIN_WITHDRAW_FUNCTION = 'function withdrawAdmin(uint112 _amountRequested)';
        const ABI = [ADMIN_WITHDRAW_FUNCTION];
        const vestingContractInterface = new ethers.utils.Interface(ABI);
        const adminWithdrawEncoded = vestingContractInterface.encodeFunctionData('withdrawAdmin', [
          vestingContractInfo?.reserved
        ]);
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const txData = {
          to: vestingContractAddress,
          data: adminWithdrawEncoded,
          value: '0'
        };
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
        const txHash = await safeSdk.getTransactionHash(safeTransaction);
        const signature = await safeSdk.signTransactionHash(txHash);
        setTransactionLoaderStatus('IN_PROGRESS');
        safeTransaction.addSignature(signature);
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        await safeService.proposeTransaction({
          safeAddress: safe.address,
          senderAddress: account,
          safeTransactionData: safeTransaction.data,
          safeTxHash: txHash,
          senderSignature: signature.data
        });
        const transactionData: ITransaction = {
          hash: '',
          safeHash: txHash,
          status: 'PENDING',
          to: vestingContractAddress,
          type: 'ADMIN_WITHDRAW',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds: [],
          withdrawAmount: ethers.utils.formatUnits(vestingContractInfo!.reserved, mintFormState?.decimals || 18),
          vestingContractId: vestingContracts[0].id
        };
        const transactionId = await createTransaction(transactionData);
        toast.success('Transaction has been created successfully.');
        setTransactionLoaderStatus('SUCCESS');
        // setWithdrawTransactions([
        //   ...withdrawTransactions,
        //   {
        //     id: transactionId,
        //     data: transactionData
        //   }
        // ]);
      } else {
        const withdrawTransaction = await vestingContract.withdrawAdmin(vestingContractInfo?.reserved);
        const transactionData: ITransaction = {
          hash: withdrawTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: vestingContractAddress,
          type: 'ADMIN_WITHDRAW',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds: [],
          withdrawAmount: ethers.utils.formatUnits(vestingContractInfo!.reserved, mintFormState?.decimals || 18),
          vestingContractId: vestingContracts[0].id
        };
        const transactionId = await createTransaction(transactionData);
        await withdrawTransaction.wait();
        await updateTransaction(
          {
            ...transactionData,
            status: 'SUCCESS',
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          transactionId
        );
        toast.success('Withdrew tokens successfully.');
        setTransactionLoaderStatus('SUCCESS');
        // setWithdrawTransactions([
        //   ...withdrawTransactions,
        //   {
        //     id: transactionId,
        //     data: { ...transactionData, status: 'SUCCESS', updatedAt: Math.floor(new Date().getTime() / 1000) }
        //   }
        // ]);
      }
      initRecipientAllocation(vestingContractAddress);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-9">
        {uniqueVestingContracts.map((vestingContract) => {
          return (
            <div
              key={vestingContract.id}
              className="mb-3 w-full px-6 py-3 bg-warning-100 border border-warning-500 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#344054]">Unallocated tokens</div>
                <div className="text-label text-sm">
                  You can now transfer the locked tokens from revoke schedule under <b>{vestingContract.data.name}'s</b>{' '}
                  contract and transfer them back to your wallet.
                </div>
              </div>
              <button
                className="secondary small whitespace-nowrap"
                onClick={() => handleTransfer(vestingContract.data.address)}>
                Transfer Tokens
              </button>
            </div>
          );
        })}

        <div className="flex justify-between">
          <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
            Contracts
          </Typography>
          <button className="primary row-center" onClick={showModal}>
            <PlusIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Create</span>
          </button>
        </div>

        <div className="flex items-center mt-2">
          <Image src={String(token?.logo) || '/icons/ethereum.svg'} alt="token-image" width={18} height={18} />
          <Typography size="base" variant="inter" className=" font-medium text-neutral-900 ml-2 mr-9">
            {token.name}
          </Typography>
          <Copy text={token?.address || ''}>
            <p className="paragraphy-small ">
              {token.address.slice(0, 5)}...{token.address.slice(-4)}
            </p>
          </Copy>
        </div>
      </div>

      <ContractsProfile vestingContractsInfo={vestingContractsInfo} count={vestingContracts.length} title="Contract" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 px-6">
        {!vestingContracts
          ? Array.from(new Array(3)).map((_, index) => (
              <div key={index} className="animate-pulse w-full">
                <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
              </div>
            ))
          : vestingContracts.map((vestingContractInfo) => {
              const vestingInfo = getVestingInfoByContract(String(vestingContractInfo?.data.address));
              return (
                <VestingContractCard
                  key={vestingContractInfo.id}
                  title={String(vestingContractInfo.data.name)}
                  address={vestingContractInfo.data.address}
                  totalAllocation={formatEther(vestingInfo?.allocation.toString()) || ''}
                  withdrawnAmount={Number(formatEther(String(vestingInfo?.withdrawn))).toFixed(2)}
                  unclaimedAmount={Number(formatEther(String(vestingInfo?.unclaimed))).toFixed(2)}
                  totalLockedAmount={Number(formatEther(String(vestingInfo?.locked))).toFixed(2)}
                  buttonLabel="View contract"
                  buttonAction={() => router.push(`/contracts/${vestingContractInfo.id}`)}
                />
              );
            })}

        <div
          className={`w-full border border-primary-50 rounded-10 p-6 font-medium flex justify-center items-center min-h-[272px]`}>
          <div className="flex flex-col items-center gap-3">
            <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />
            <Typography size="subtitle" variant="inter" className=" font-bold text-neutral-800 ">
              New Contract
            </Typography>
            <button
              type="button"
              className="px-5 bg-secondary-900 border border-secondary-900 rounded-8 p-1"
              onClick={showModal}>
              <Typography className="text-center text-white font-medium" size="base">
                Create
              </Typography>
            </button>
          </div>
        </div>
      </div>
      <ModalWrapper>
        <CreateVestingContractModal hideModal={hideModal} />
      </ModalWrapper>
    </div>
  );
}
