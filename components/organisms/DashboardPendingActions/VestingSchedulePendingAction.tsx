import TransactionApiService from '@api-services/TransactionApiService';
import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import DropdownMenu from '@components/molecules/DropdownMenu/DropdownMenu';
import { injected } from '@connectors/index';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import {
  IStatus, // ITransactionStatus,
  STATUS_MAPPING // TRANSACTION_STATUS_MAPPING
} from 'components/organisms/DashboardPendingActions';
import FundingContractModalV2 from 'components/organisms/FundingContractModal/FundingContractModalV2';
import VTVL_VESTING_ABI from 'contracts/abi/FactoryVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import useIsAdmin from 'hooks/useIsAdmin';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
// import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting } from 'types/models';
import { ClaimInput } from 'types/models/vesting';
import { TOAST_IDS } from 'utils/constants';
import { formatNumber, parseTokenAmount } from 'utils/token';
import { getChartData, getCliffAmount, getCliffDateTime, getReleaseFrequencyTimestamp } from 'utils/vesting';

interface IVestingContractPendingActionProps {
  id: string;
  data: IVesting;
  filter: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  };
  updateFilter: (v: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  }) => void;
  isBatchTransaction: boolean;
}

const VestingSchedulePendingAction: React.FC<IVestingContractPendingActionProps> = ({
  id,
  data,
  filter,
  updateFilter,
  isBatchTransaction
}) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  const {
    vestingContracts,
    fetchDashboardVestings,
    fetchDashboardData,
    vestings,
    vestingsStatus,
    recipients,
    setVestingsStatus,
    safeTransactions,
    setSafeTransactions
  } = useDashboardContext();
  const { editSchedule, deleteSchedulePrompt, setShowDeleteModal } = useVestingContext();
  const {
    transactions,
    pendingTransactions,
    transactionStatus: transactionLoaderStatus,
    setTransactionStatus: setTransactionLoaderStatus,
    setIsCloseAvailable,
    updateTransactions
  } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();
  const vestingContract = useMemo(
    () => vestingContracts.find((contract) => contract.id === data.vestingContractId),
    [data, vestingContracts]
  );
  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transactionId && t.status === 'PENDING'),
    [data, transactions]
  );

  const isAdmin = useIsAdmin(currentSafe ? currentSafe.address : account ? account : '', vestingContract);
  const [status, setStatus] = useState<IStatus>('');

  const [transactionStatus, setTransactionStatus] = useState<
    'INITIALIZE' | 'EXECUTABLE' | 'WAITING_APPROVAL' | 'APPROVAL_REQUIRED' | ''
  >('');
  const [isExecutableAfterApprove, setIsExecutableAfterApprove] = useState(false);
  const [showFundingContractModal, setShowFundingContractModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  const vestingRecipients = useMemo(
    () => recipients?.filter((recipient) => recipient.vestingId === id) ?? [],
    [recipients, id]
  );

  const isVisible =
    status !== 'SUCCESS' &&
    (filter.status === 'ALL' ||
      (filter.status === 'FUND' && status === 'FUNDING_REQUIRED') ||
      (filter.status === 'APPROVE' && transactionStatus === 'APPROVAL_REQUIRED') ||
      (filter.status === 'EXECUTE' && (transactionStatus === 'EXECUTABLE' || status === 'AUTHORIZATION_REQUIRED')));

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId && txHash) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      setSafeTransactions({ ...safeTransactions, [txHash]: safeTx });
      return safeTx;
    }
  };

  const initializeStatus = async () => {
    if (
      !vestingContract ||
      vestingContract.status === 'INITIALIZED' ||
      (vestingContract.status === 'PENDING' && currentSafe?.address)
    ) {
      setStatus('CONTRACT_REQUIRED');
      return;
    }

    if (transaction && transaction.safeHash && currentSafe && account) {
      const safeTx = safeTransactions[transaction.safeHash]
        ? safeTransactions[transaction.safeHash]
        : !isBatchTransaction
        ? await fetchSafeTransactionFromHash(transaction.safeHash)
        : null;

      if (safeTx) {
        setSafeTransaction(safeTx);
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const threshold = await safeSdk.getThreshold();
        // const approvers = transaction.approvers ? [...transaction.approvers] : [];
        // safeTx.signatures.forEach((signature) => {
        //   if (!approvers.find((approver) => approver === signature.signer)) {
        //     approvers.push(signature.signer);
        //   }
        // });
        if (safeTx.signatures.size >= threshold) {
          setStatus(transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'EXECUTABLE');
          setTransactionStatus('EXECUTABLE');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'EXECUTABLE'
          });
        } else if (safeTx.signatures.has(account.toLowerCase())) {
          setStatus(transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('WAITING_APPROVAL');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'PENDING'
          });
        } else {
          setStatus(transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('APPROVAL_REQUIRED');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'PENDING'
          });
          if (safeTx.signatures.size === threshold - 1) {
            setIsExecutableAfterApprove(true);
          }
        }
      } else {
        return;
      }
    } else {
      const TokenContract = new ethers.Contract(
        mintFormState.address ?? '',
        [
          // Read-Only Functions
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          // Authenticated Functions
          'function transfer(address to, uint amount) returns (bool)',
          // Events
          'event Transfer(address indexed from, address indexed to, uint amount)'
        ],
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      const VestingContract = new ethers.Contract(
        vestingContract?.address || '',
        VTVL_VESTING_ABI,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );

      const tokenBalance = await TokenContract.balanceOf(vestingContract?.address);
      // const tokenBalance = vestingContract.balance || 0;

      const numberOfTokensReservedForVesting = await VestingContract.numTokensReservedForVesting();

      if (
        BigNumber.from(tokenBalance).gte(BigNumber.from(numberOfTokensReservedForVesting)) &&
        BigNumber.from(tokenBalance)
          .sub(BigNumber.from(numberOfTokensReservedForVesting))
          .lt(ethers.utils.parseEther(data.details.amountToBeVested.toString()))
      ) {
        setStatus('FUNDING_REQUIRED');
        setDepositAmount(
          ethers.utils.formatEther(
            ethers.utils
              .parseEther(data.details.amountToBeVested.toString())
              .sub(BigNumber.from(tokenBalance).sub(BigNumber.from(numberOfTokensReservedForVesting)))
          )
        );
        setTransactionStatus('INITIALIZE');
        setVestingsStatus({
          ...vestingsStatus,
          [id]: 'FUNDING_REQUIRED'
        });
      } else {
        setStatus('AUTHORIZATION_REQUIRED');
        setTransactionStatus('INITIALIZE');
        setVestingsStatus({
          ...vestingsStatus,
          [id]: 'PENDING'
        });
      }
    }
  };

  const handleExecuteFundingTransaction = async () => {
    try {
      setIsCloseAvailable(true);
      if (currentSafe?.address && chainId && safeTransaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const currentNonce = await safeSdk.getNonce();
        if (currentNonce !== apiTx.nonce) {
          toast.error('You have pending transactions that should be executed first.');
          setTransactionLoaderStatus('ERROR');
          return;
        }
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();
        if (transaction) {
          const t = await TransactionApiService.updateTransaction(data.transactionId, {
            status: 'SUCCESS'
          });
          updateTransactions(t);
          const batchVestings = vestings.filter((vesting) => vesting.data.transactionId === data.transactionId);
          await Promise.all(
            batchVestings.map(async (vesting) => {
              await VestingScheduleApiService.updateVestingSchedule(
                {
                  ...vesting.data,
                  // Because all batched vesting schedules are now ready for distribution
                  status: 'INITIALIZED'
                },
                vesting.id
              );
            })
          );
        }
        // setStatus('AUTHORIZATION_REQUIRED');
        // setTransactionStatus('INITIALIZE');
        toast.success('Funded successfully.');
        await fetchDashboardData();
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleExecuteFundingTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleFundContract = async (type: string, amount: string) => {
    try {
      if (!account || !chainId) {
        // activate(injected);
        toast.info('Connect your wallet and try again.');
        return;
      }
      setIsCloseAvailable(true);
      if (type === 'Metamask') {
        setTransactionLoaderStatus('PENDING');
        const tokenContract = new ethers.Contract(
          mintFormState.address ?? '',
          [
            // Read-Only Functions
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            'function allowance(address owner, address spender) view returns (uint256)',
            // Authenticated Functions
            'function approve(address spender, uint256 amount) returns (bool)',
            'function transfer(address to, uint amount) returns (bool)',
            // Events
            'event Transfer(address indexed from, address indexed to, uint amount)'
          ],
          library.getSigner()
        );

        const allowance = await tokenContract.allowance(account, vestingContract?.address);
        if (allowance.lt(ethers.utils.parseEther(amount))) {
          const approveTx = await tokenContract.approve(
            vestingContract?.address,
            ethers.utils.parseEther(amount).sub(allowance)
          );
          await approveTx.wait();
        }

        const fundTransaction = await tokenContract.transfer(vestingContract?.address, ethers.utils.parseEther(amount));
        setShowFundingContractModal(false);

        setTransactionLoaderStatus('IN_PROGRESS');
        await fundTransaction.wait();
        // This should have a function to update the vesting schedule status
        // From INITIALIZED into WAITING_APPROVAL
        console.log({ data });
        await VestingScheduleApiService.updateVestingSchedule(
          {
            ...data,
            status: 'WAITING_APPROVAL'
          },
          id
        );
        toast.success('Token deposited successfully');
        setStatus('SUCCESS');
        setTransactionLoaderStatus('SUCCESS');
      } else {
        const tokenContractInterface = new ethers.utils.Interface([
          'function transfer(address to, uint amount) returns (bool)',
          // Events
          'event Transfer(address indexed from, address indexed to, uint amount)'
        ]);
        const transferEncoded = tokenContractInterface.encodeFunctionData('transfer', [
          ethers.utils.getAddress(vestingContract?.address ?? ''),
          ethers.utils.parseEther(amount)
        ]);
        if (currentSafe?.address && account && chainId && organizationId) {
          if (currentSafe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
            setTransactionLoaderStatus('PENDING');
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
              to: ethers.utils.getAddress(mintFormState.address ?? ''),
              data: transferEncoded,
              value: '0',
              nonce: nextNonce
            };
            const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
            const txHash = await safeSdk.getTransactionHash(safeTransaction);
            const signature = await safeSdk.signTransactionHash(txHash);
            setTransactionLoaderStatus('IN_PROGRESS');
            setShowFundingContractModal(false);

            safeTransaction.addSignature(signature);
            await safeService.proposeTransaction({
              safeAddress: currentSafe.address,
              senderAddress: account,
              safeTransactionData: safeTransaction.data,
              safeTxHash: txHash,
              senderSignature: signature.data
            });

            const transaction = await TransactionApiService.createTransaction({
              hash: '',
              safeHash: txHash,
              status: 'PENDING',
              to: vestingContract?.address ?? '',
              type: 'FUNDING_CONTRACT',

              organizationId: organizationId,
              // approvers: [account],
              fundingAmount: amount,
              chainId
            });
            updateTransactions(transaction);
            await VestingScheduleApiService.updateVestingSchedule(
              {
                ...data,
                status: 'WAITING_FUNDS',
                transactionId: transaction.id ?? ''
              },
              id
            );
            await fetchDashboardData();
            toast.success(`Funding transaction with nonce ${nextNonce} has been created successfully`);
            setTransactionLoaderStatus('SUCCESS');
          } else {
            toast.error('You are not a signer of this multisig wallet.');
            return;
          }
        }
      }
    } catch (err) {
      console.log('fundContract - ', err);
      toast.error((err as any).reason ? (err as any).reason : 'Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const hasNoWalletAddress = useMemo(() => {
    const addresses = vestingRecipients.map((recipient) => recipient.address);
    return addresses.filter((address) => !address).length > 0;
  }, [vestingRecipients]);

  const handleCreateSignTransaction = async () => {
    try {
      if (!account || !library) {
        activate(injected);
        return;
      }
      const totalRecipients = vestingRecipients.length;
      const vesting = data;
      const vestingId = id;

      const cliffAmountPerUser =
        getCliffAmount(
          vesting.details.cliffDuration,
          +vesting.details.lumpSumReleaseAfterCliff,
          +vesting.details.amountToBeVested
        ) / totalRecipients;
      const vestingAmountPerUser = +vesting.details.amountToBeVested / totalRecipients - cliffAmountPerUser;
      const addresses = vestingRecipients.map((recipient) => recipient.address);

      if (hasNoWalletAddress) {
        toast.error("Some recipients don't have wallet address.");
        return;
      }

      const vestingStartTime = vesting.details.startDateTime!;

      const cliffReleaseDate =
        vesting.details.startDateTime && vesting.details.cliffDuration !== 'no_cliff'
          ? getCliffDateTime(vestingStartTime, vesting.details.cliffDuration)
          : '';
      const cliffReleaseTimestamp = cliffReleaseDate ? Math.floor(cliffReleaseDate.getTime() / 1000) : 0;

      const actualStartDateTime = vesting.details.cliffDuration !== 'no_cliff' ? cliffReleaseDate : vestingStartTime;
      const vestingEndTimestamp =
        vesting.details.endDateTime && actualStartDateTime
          ? getChartData({
              start: actualStartDateTime,
              end: vesting.details.endDateTime!,
              cliffDuration: vesting.details.cliffDuration,
              cliffAmount: cliffAmountPerUser,
              frequency: vesting.details.releaseFrequency,
              vestedAmount: vestingAmountPerUser
            }).projectedEndDateTime
          : null;
      // const vestingStartTimestamps = new Array(totalRecipients).fill(
      //   cliffReleaseTimestamp ? cliffReleaseTimestamp : Math.floor(getUnixTime(vesting.details.startDateTime!))
      // );
      // let vestingEndTimestamps = new Array(totalRecipients).fill(getUnixTime(vestingEndTimestamp ?? new Date()));
      // const vestingCliffTimestamps = new Array(totalRecipients).fill(cliffReleaseTimestamp);

      const releaseFrequencyTimestamp = getReleaseFrequencyTimestamp(
        vestingStartTime,
        vestingEndTimestamp!,
        vesting.details.releaseFrequency,
        vesting.details.cliffDuration
      );
      // const vestingReleaseIntervals = new Array(totalRecipients).fill(releaseFrequencyTimestamp);
      // const vestingLinearVestAmounts = vestingRecipients.map((recipient) => {
      //   return ethers.utils
      //     .parseUnits(recipient.allocations, 18)
      //     .sub(ethers.utils.parseUnits(cliffAmountPerUser.toString(), 18))
      //     .toString();
      // });

      // vestingEndTimestamps = vestingEndTimestamps.map((endTimeStamp: number, index: number) => {
      //   if ((endTimeStamp - vestingStartTimestamps[index]) % vestingReleaseIntervals[index] !== 0) {
      //     const times = Math.floor(endTimeStamp / vestingReleaseIntervals[index]);
      //     return vestingStartTimestamps[index] + vestingReleaseIntervals[index] * (times + 1);
      //   }
      //   return endTimeStamp;
      // });

      // vestingEndTimestamps = vestingEndTimestamps.map((endTimeStamp: number, index: number) => {
      //   if ((endTimeStamp - vestingStartTimestamps[index]) % vestingReleaseIntervals[index] !== 0) {
      //     const times = Math.floor(endTimeStamp / vestingReleaseIntervals[index]);
      //     return vestingStartTimestamps[index] + vestingReleaseIntervals[index] * (times + 1);
      //   }
      //   return endTimeStamp;
      // });
      const startTime = cliffReleaseTimestamp
        ? cliffReleaseTimestamp
        : Math.floor(getUnixTime(vesting.details.startDateTime!));
      let endTimeStamp = getUnixTime(vestingEndTimestamp ?? new Date());
      if ((endTimeStamp - startTime) % releaseFrequencyTimestamp !== 0) {
        const times = Math.floor(endTimeStamp / releaseFrequencyTimestamp);
        endTimeStamp = startTime + releaseFrequencyTimestamp * (times + 1);
      }

      const claimInputs: ClaimInput[] = vestingRecipients.map((recipient) => {
        return {
          startTimestamp: startTime,
          endTimestamp: endTimeStamp,
          cliffReleaseTimestamp: cliffReleaseTimestamp,
          releaseIntervalSecs: releaseFrequencyTimestamp,
          linearVestAmount: ethers.utils.parseEther(vestingAmountPerUser.toString()),
          cliffAmount: ethers.utils.parseEther(cliffAmountPerUser.toString()),
          recipient: recipient.address
        };
      });

      const vestingContractInterface = new ethers.utils.Interface(VTVL_VESTING_ABI);
      const createClaimsBatchEncoded = vestingContractInterface.encodeFunctionData('createClaimsBatch', [claimInputs]);
      setIsCloseAvailable(false);

      if (currentSafe?.address && account && chainId && organizationId) {
        if (!isAdmin) {
          toast.error(
            "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
          );
          return;
        }
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        setTransactionLoaderStatus('PENDING');
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });

        const nextNonce = await safeService.getNextNonce(currentSafe.address);

        const txData = {
          to: ethers.utils.getAddress(vestingContract?.address ?? ''),
          data: createClaimsBatchEncoded,
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

        if (account && organizationId) {
          const transaction = await TransactionApiService.createTransaction({
            hash: '',
            safeHash: txHash,
            status: 'PENDING',
            to: vestingContract?.address ?? '',
            type: 'ADDING_CLAIMS',

            organizationId: organizationId,
            chainId,
            vestingIds: [vestingId]
            // approvers: [account]
          });
          updateTransactions(transaction);
          await VestingScheduleApiService.updateVestingSchedule(
            {
              ...data,
              // Because all batched vesting schedules are now ready for distribution
              transactionId: transaction.id ?? '',
              status: 'WAITING_APPROVAL'
            },
            id
          );

          toast.success(`Created a transaction with nonce ${nextNonce} successfully`);

          await fetchDashboardData();
        }
        toast.success('Transaction has been created successfully.');
        setTransactionLoaderStatus('SUCCESS');
      } else if (account && chainId && organizationId) {
        if (!isAdmin) {
          toast.error(
            "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
          );
          return;
        }

        setTransactionLoaderStatus('PENDING');
        const vestingContractInstance = new ethers.Contract(
          vestingContract?.address ?? '',
          VTVL_VESTING_ABI,
          library.getSigner()
        );

        const addingClaimsTransaction = await vestingContractInstance.createClaimsBatch(claimInputs);

        setTransactionLoaderStatus('IN_PROGRESS');
        const transactionData: ITransactionRequest = {
          hash: addingClaimsTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: vestingContract?.address ?? '',
          type: 'ADDING_CLAIMS',
          organizationId: organizationId,
          chainId,
          vestingIds: [vestingId]
        };
        const transaction = await TransactionApiService.createTransaction(transactionData);
        updateTransactions(transaction);
        await VestingScheduleApiService.updateVestingSchedule(
          {
            ...vesting,
            transactionId: transaction.id,
            // Because the schedule is now confirmed and ready for the vesting
            status: 'LIVE'
          },
          vestingId
        );
        await addingClaimsTransaction.wait();
        const t = await TransactionApiService.updateTransaction(transaction.id, {
          status: 'SUCCESS',
          organizationId
        });
        updateTransactions(t);
        await fetchDashboardData();
        setStatus('SUCCESS');
        toast.success('Added schedules successfully.', { toastId: TOAST_IDS.SUCCESS });
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleCreateSignTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleApproveTransaction = async () => {
    try {
      setIsCloseAvailable(false);
      if (currentSafe?.address && chainId && transaction && account) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(transaction?.safeHash as string));
        // const t = await TransactionApiService.updateTransaction(transaction.id, {
        //   approvers: transaction.approvers ? [...transaction.approvers, account] : [account]
        // });
        // updateTransactions({...transaction, approvers:});
        toast.success('Approved successfully.');
        setTransactionStatus('EXECUTABLE');
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleApproveTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleExecuteTransaction = async () => {
    setIsCloseAvailable(true);
    try {
      if (currentSafe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const currentNonce = await safeSdk.getNonce();
        if (currentNonce !== apiTx.nonce) {
          toast.error('You have pending transactions that should be executed first.');
          setTransactionLoaderStatus('ERROR');
          return;
        }
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();
        if (transaction) {
          const t = await TransactionApiService.updateTransaction(data.transactionId, {
            status: 'SUCCESS'
          });
          updateTransactions(t);

          // Ensure that vesting list is updated
          await fetchDashboardVestings();

          const activeBatchVestings = vestings.filter(
            (bv) => bv.data.transactionId === transaction.id && !bv.data.archive
          );

          await Promise.all(
            activeBatchVestings.map(async (vesting) => {
              await VestingScheduleApiService.updateVestingSchedule(
                {
                  ...vesting.data,
                  // Because all batched vesting schedules are now ready for distribution
                  status: 'LIVE'
                },
                vesting.id
              );
            })
          );
          await fetchDashboardData();
        }
        setStatus('SUCCESS');
        setTransactionLoaderStatus('SUCCESS');
        setTransactionStatus('');
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleDeleteSchedule = (id: string, data: IVesting) => {
    // Should prompt the user
    console.log('Deleting', id, data);
    deleteSchedulePrompt(id, data);
    // Show delete html can be seen in DefaultLayout.tsx
    // while the data is handle in the vestingContext
    setShowDeleteModal(true);
  };

  useEffect(() => {
    if (!transactionLoaderStatus || transactionLoaderStatus === 'SUCCESS') initializeStatus();
  }, [
    data,
    currentSafe,
    account,
    vestingContract,
    transactions,
    transaction,
    isBatchTransaction,
    safeTransactions,
    transactionLoaderStatus
  ]);

  return isVisible ? (
    <div className="flex bg-white text-[#667085] text-xs">
      <div className="flex items-center w-4 lg:w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{data.name}</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">Vesting Schedule</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {!!status && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap cursor-pointer"
            onClick={() => {
              if (status === 'FUNDING_REQUIRED') {
                updateFilter({ ...filter, status: 'FUND' });
              } else if (transactionStatus === 'EXECUTABLE') {
                updateFilter({ ...filter, status: 'EXECUTE' });
              } else if (transactionStatus === 'APPROVAL_REQUIRED' || transactionStatus === 'WAITING_APPROVAL') {
                updateFilter({ ...filter, status: 'APPROVE' });
              }
            }}>
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{vestingContract?.name}</div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {currentSafe ? (
          <div className="flex gap-1.5 items-center">
            <img className="w-4 h-4" src="icons/safe_wallet.svg" />
            {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
          </div>
        ) : (
          'N/A'
        )}
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        <div className="flex gap-1.5 items-center">{safeTransaction?.data.nonce}</div>
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {formatNumber(data.details.amountToBeVested)}
      </div>
      <div className="flex items-center min-w-[350px] flex-grow py-3 pr-2 justify-stretch border-t border-[#d0d5dd] bg-gradient-to-l from-white via-white to-transparent  sticky right-0">
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'INITIALIZE' && (
          <button
            className="secondary small whitespace-nowrap"
            onClick={handleCreateSignTransaction}
            disabled={transactionLoaderStatus === 'IN_PROGRESS' || hasNoWalletAddress}>
            Deploy schedule
          </button>
        )}
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'WAITING_APPROVAL' && (
          <button className="secondary small whitespace-nowrap" disabled>
            Waiting approval
          </button>
        )}
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'APPROVAL_REQUIRED' && (
          <div className="flex gap-4">
            <button className="secondary small whitespace-nowrap" onClick={handleApproveTransaction}>
              Approve
            </button>
            {isExecutableAfterApprove && (
              <button className="secondary small whitespace-nowrap" onClick={handleExecuteTransaction}>
                Approve & Execute
              </button>
            )}
          </div>
        )}
        {(status === 'AUTHORIZATION_REQUIRED' || status === 'EXECUTABLE') && transactionStatus === 'EXECUTABLE' && (
          <button
            className="secondary small whitespace-nowrap"
            onClick={handleExecuteTransaction}
            disabled={transactionLoaderStatus === 'IN_PROGRESS'}>
            Execute
          </button>
        )}
        {status === 'FUNDING_REQUIRED' && transactionStatus === 'INITIALIZE' && (
          <>
            <button
              className="secondary small whitespace-nowrap"
              disabled={transactionLoaderStatus === 'IN_PROGRESS'}
              onClick={() => {
                setShowFundingContractModal(true);
              }}>
              Fund Contract
            </button>
            <DropdownMenu
              items={[
                { label: 'Edit', onClick: () => editSchedule(id, data) },
                { label: 'Delete', onClick: () => handleDeleteSchedule(id, data) }
              ]}
            />
          </>
        )}
        {status === 'FUNDING_REQUIRED' && transactionStatus === 'APPROVAL_REQUIRED' && (
          <div className="flex gap-4">
            <button className="secondary small whitespace-nowrap" onClick={handleApproveTransaction}>
              Approve Funding
            </button>
            {isExecutableAfterApprove && (
              <button className="secondary small whitespace-nowrap" onClick={handleExecuteFundingTransaction}>
                Approve & Execute Funding
              </button>
            )}
          </div>
        )}
        {status === 'FUNDING_REQUIRED' && transactionStatus === 'WAITING_APPROVAL' && (
          <button
            className="secondary small whitespace-nowrap"
            disabled
            onClick={() => {
              // setShowFundingContractModal(true);
            }}>
            Approved
          </button>
        )}
        {status === 'FUNDING_REQUIRED' && transactionStatus === 'EXECUTABLE' && (
          <button
            className="secondary small whitespace-nowrap"
            onClick={handleExecuteFundingTransaction}
            disabled={transactionLoaderStatus === 'IN_PROGRESS'}>
            Execute Funding
          </button>
        )}
      </div>
      {vestingContract && (
        <FundingContractModalV2
          isOpen={showFundingContractModal}
          vestingContract={vestingContract}
          hideModal={() => setShowFundingContractModal(false)}
          depositAmount={depositAmount}
          handleFundContract={handleFundContract}
        />
      )}
    </div>
  ) : null;
};

export default VestingSchedulePendingAction;
