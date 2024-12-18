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
import ERC20ABI from 'contracts/abi/ERC20.json';
import VestingABI from 'contracts/abi/VtvlVesting.json';
import { ethers } from 'ethers';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import useIsAdmin from 'hooks/useIsAdmin';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { updateRecipient } from 'services/db/recipient';
import { fetchRevokingsByQuery } from 'services/db/revoking';
import { createOrUpdateSafe } from 'services/db/safe';
import { createTransaction, fetchTransactionsByQuery, updateTransaction } from 'services/db/transaction';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';
import { IRevokingDoc } from 'types/models/revoking';
import { IVestingDoc } from 'types/models/vesting';
import { isV2 } from 'utils/multicall';
import { formatNumber } from 'utils/token';
import { string } from 'yup';

import ContractsProfile from './VestingContractsProfile';
import VestingFilter from './Vestings';

export default function VestingContract({ vestingContractId }: { vestingContractId: string }) {
  const { chainId, library, account } = useWeb3React();
  const {
    vestings: allVestings,
    vestingContracts: allVestingContracts,
    recipients: allRecipients
  } = useDashboardContext();
  const { mintFormState } = useTokenContext();
  const [revokings, setRevokings] = useState<IRevokingDoc[]>();

  const { currentSafe, organizationId, currentSafeId, setCurrentSafe } = useAuthContext();
  const { setTransactionStatus: setTransactionLoaderStatus } = useTransactionLoaderContext();

  const [withdrawAmount, setWithdrawAmount] = useState(ethers.BigNumber.from(0));
  const [withdrawTransactions, setWithdrawTransactions] = useState<{ id: string; data: ITransaction }[]>([]);

  const router = useRouter();
  const vestings = useMemo(() => {
    return allVestings.filter((vesting) => vesting.data.vestingContractId === vestingContractId);
  }, [allVestings]);

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

  const vestingContracts = useMemo(() => {
    const selectedVestingContract = allVestingContracts?.find((contract) => contract.id === vestingContractId);
    return selectedVestingContract ? [selectedVestingContract] : [];
  }, [allVestingContracts]);

  const isAdmin = useIsAdmin(
    currentSafe ? currentSafe.address : account ? account : '',
    vestingContracts && vestingContracts.length > 0 ? vestingContracts[0].data : undefined
  );

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContracts,
    allVestings,
    allRecipients
  );

  const availableRevokings = useMemo(() => {
    if (revokings && vestings && allRecipients) {
      return revokings.filter((revoking) => {
        const rc = allRecipients.find(
          (recipient) =>
            recipient.data.vestingId === revoking.data.vestingId &&
            recipient.data.walletAddress === revoking.data.recipient &&
            vestings.map((vesting) => vesting.id).includes(recipient.data.vestingId)
        );
        return rc && Number(rc.data.allocations) !== 0;
      });
    } else {
      return [];
    }
  }, [revokings, allRecipients, vestings]);

  const vestingContractsInfo = useMemo(() => {
    if (!vestingSchedulesInfo || !vestingSchedulesInfo.length || !vestingContracts.length) return undefined;
    let allocation = ethers.BigNumber.from(0),
      unclaimed = ethers.BigNumber.from(0),
      withdrawn = ethers.BigNumber.from(0),
      locked = ethers.BigNumber.from(0);
    vestingSchedulesInfo.forEach((vesting) => {
      allocation = allocation.add(vesting.allocation);
      unclaimed = unclaimed.add(vesting.unclaimed);
      withdrawn = withdrawn.add(vesting.withdrawn);
      locked = locked.add(vesting.locked);
    });
    return {
      address: vestingSchedulesInfo[0].address,
      recipient: '',
      allocation: allocation,
      unclaimed: unclaimed,
      withdrawn: withdrawn,
      locked: locked,
      reserved: vestingSchedulesInfo.length
        ? ethers.BigNumber.from(vestingContracts[0]?.data.balance || '0').sub(
            vestingSchedulesInfo[0].numTokensReservedForVesting || '0'
          )
        : ethers.BigNumber.from(0)
    };
  }, [vestingSchedulesInfo, vestingContracts]);

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

  const handleWithdraw = async () => {
    if (vestingContracts && vestingContracts.length > 0 && organizationId && chainId && account) {
      const vestingContractAddress = vestingContracts[0].data.address;
      const vestingContract = new ethers.Contract(vestingContractAddress, VestingABI.abi, library.getSigner());
      if (currentSafe?.address) {
        if (!isAdmin) {
          toast.error(
            "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
          );
          return;
        }

        const ADMIN_WITHDRAW_FUNCTION = isV2(vestingContracts[0].data.updatedAt)
          ? 'function withdrawAdmin(uint256 _amountRequested)'
          : 'function withdrawAdmin(uint112 _amountRequested)';
        const ABI = [ADMIN_WITHDRAW_FUNCTION];
        const vestingContractInterface = new ethers.utils.Interface(ABI);
        const adminWithdrawEncoded = vestingContractInterface.encodeFunctionData('withdrawAdmin', [
          withdrawAmount.toString()
        ]);
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });

        const nextNonce = await safeService.getNextNonce(currentSafe.address);
        const txData = {
          to: vestingContractAddress,
          data: adminWithdrawEncoded,
          value: '0',
          nonce: nextNonce
        };
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
        const txHash = await safeSdk.getTransactionHash(safeTransaction);
        const signature = await safeSdk.signTransactionHash(txHash);
        setTransactionLoaderStatus('IN_PROGRESS');
        safeTransaction.addSignature(signature);

        await safeService.proposeTransaction({
          safeAddress: currentSafe.address,
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
          withdrawAmount: ethers.utils.formatUnits(withdrawAmount, mintFormState?.decimals || 18),
          vestingContractId: vestingContracts[0].id
        };
        const transactionId = await createTransaction(transactionData);

        toast.success(`Withdraw transaction with nonce ${nextNonce} has been created successfully.`);
        setTransactionLoaderStatus('SUCCESS');
        setWithdrawTransactions([
          ...withdrawTransactions,
          {
            id: transactionId,
            data: transactionData
          }
        ]);
      } else {
        const withdrawTransaction = await vestingContract.withdrawAdmin(withdrawAmount);
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
          withdrawAmount: ethers.utils.formatUnits(withdrawAmount, mintFormState?.decimals || 18),
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
        setWithdrawTransactions([
          ...withdrawTransactions,
          {
            id: transactionId,
            data: { ...transactionData, status: 'SUCCESS', updatedAt: Math.floor(new Date().getTime() / 1000) }
          }
        ]);
      }
      initRecipientAllocation(vestingContractAddress);
    }
  };

  useEffect(() => {
    if (vestingContracts && vestingContracts.length > 0 && chainId) {
      const vestingContractAddress = vestingContracts[0].data.address;
      fetchTransactionsByQuery(
        ['address', 'chainId', 'type', 'status'],
        ['==', '==', '==', '=='],
        [vestingContractAddress, chainId, 'ADMIN_WITHDRAW', 'PENDING']
      ).then((res) => setWithdrawTransactions(res));
    }
  }, [vestingContracts, chainId]);

  useEffect(() => {
    if (
      mintFormState.address &&
      vestingContracts &&
      vestingContracts.length > 0 &&
      chainId &&
      library &&
      vestingSchedulesInfo &&
      vestingSchedulesInfo.length > 0
    ) {
      const tokenContract = new ethers.Contract(mintFormState.address, ERC20ABI, library.getSigner());
      tokenContract.balanceOf(vestingContracts[0].data.address).then((res: ethers.BigNumber) => {
        setWithdrawAmount(
          ethers.BigNumber.from(res).sub(
            vestingSchedulesInfo[0]?.numTokensReservedForVesting ?? ethers.BigNumber.from(0)
          )
        );
      });
    }
  }, [vestingContracts, chainId, mintFormState, library, vestingSchedulesInfo]);

  return (
    <div className="w-full">
      <div className="mb-9">
        {withdrawAmount &&
          withdrawAmount.gt(ethers.BigNumber.from(0)) &&
          (!withdrawTransactions || !withdrawTransactions.length) && (
            <div className="mb-3 w-full px-6 py-3 bg-warning-100 border border-warning-500 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#344054]">Unallocated tokens</div>
                <div className="text-label text-sm">
                  The unallocated {formatNumber(+ethers.utils.formatEther(withdrawAmount))} is ready to be withdrawn.
                </div>
              </div>
              <button className="secondary small whitespace-nowrap" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
          )}

        <div className="flex justify-between">
          <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
            Contract
          </Typography>
          <button className="primary row-center" onClick={() => router.push('/vesting-schedule/add-recipients')}>
            <PlusIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Create</span>
          </button>
        </div>

        <div className="flex items-center mt-2">
          {currentSafe?.address && (
            <>
              <Image src={'/icons/safe.png'} alt="token-image" width={18} height={18} />
              <Typography size="base" variant="inter" className=" font-medium text-neutral-900 ml-2 mr-9">
                {currentSafe.org_name}
              </Typography>
            </>
          )}

          {vestingContracts[0]?.data.address ? (
            <Copy text={vestingContracts[0]?.data.address || ''}>
              <p className="paragraphy-small ">
                {vestingContracts[0]?.data.address.slice(0, 5)}...{vestingContracts[0]?.data.address.slice(-4)}
              </p>
            </Copy>
          ) : (
            <Typography>Not deployed</Typography>
          )}
        </div>
      </div>

      {vestingContractsInfo && (
        <ContractsProfile
          vestingContractsInfo={[{ ...vestingContractsInfo, reserved: withdrawAmount }]}
          count={vestings.length}
          title="Schedule"
        />
      )}

      {vestingContracts[0] && (
        <VestingFilter
          vestings={vestings}
          vestingSchedulesInfo={vestingSchedulesInfo}
          totalBalance={vestingContracts[0].data.balance || '0'}
        />
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 px-6">
        {!vestingContracts.length ? (
          Array.from(new Array(3)).map((_, index) => (
            <div key={index} className="animate-pulse w-full">
              <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
