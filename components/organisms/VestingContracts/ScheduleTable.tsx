import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import RecipientRow from '@components/molecules/VestingSchedule/RecipientRow';
import { injected } from '@connectors/index';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import {
  IStatus, // ITransactionStatus,
  STATUS_MAPPING // TRANSACTION_STATUS_MAPPING
} from 'components/organisms/DashboardPendingActions';
import FundingContractModalV2 from 'components/organisms/FundingContractModal/FundingContractModalV2';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import format from 'date-fns/format';
import { BigNumber, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import useIsAdmin from 'hooks/useIsAdmin';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createRevoking, fetchRevokingsByQuery } from 'services/db/revoking';
import { createOrUpdateSafe } from 'services/db/safe';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { fetchVestingsByQuery, updateVesting } from 'services/db/vesting';
// import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction, IVesting } from 'types/models';
import { IRevokingDoc } from 'types/models/revoking';
import { compareAddresses } from 'utils';
import { REVOKE_CLAIM_FUNCTION_ABI, TOAST_IDS } from 'utils/constants';
import { createSafeTransaction } from 'utils/safe';
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getDuration,
  getNumberOfReleases,
  getReleaseFrequencyTimestamp
} from 'utils/vesting';
import { BNToAmountString } from 'utils/web3';

const ScheduleTable: React.FC<{ id: string; data: IVesting; vestingSchedulesInfo: VestingContractInfo[] }> = ({
  id,
  data,
  vestingSchedulesInfo
}) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { currentSafe, organizationId, currentSafeId, setCurrentSafe } = useAuthContext();
  const {
    // fetchDashboardVestingContract,
    vestingContracts,
    // fetchDashboardTransactions,
    fetchDashboardData,
    vestings,
    vestingsStatus,
    recipients,
    setVestingsStatus
  } = useDashboardContext();
  const {
    pendingTransactions,
    transactions,
    transactionStatus: transactionLoaderStatus,
    setTransactionStatus: setTransactionLoaderStatus,
    setIsCloseAvailable
  } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();
  const vestingContract = useMemo(
    () => vestingContracts.find((contract) => contract.id === data.vestingContractId),
    [data, vestingContracts]
  );
  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transactionId && t.data.status === 'PENDING'),
    [data, transactions]
  );
  const vestingRecipients = useMemo(
    () => recipients?.filter((recipient) => recipient.data.vestingId === id) ?? [],
    [recipients, id]
  );

  const isAdmin = useIsAdmin(currentSafe ? currentSafe.address : account ? account : '', vestingContract?.data);

  const [status, setStatus] = useState<IStatus>('');

  const [transactionStatus, setTransactionStatus] = useState<
    'INITIALIZE' | 'EXECUTABLE' | 'WAITING_APPROVAL' | 'APPROVAL_REQUIRED' | ''
  >('');
  const [isExecutableAfterApprove, setIsExecutableAfterApprove] = useState(false);
  const [showFundingContractModal, setShowFundingContractModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [isRecipientExpand, setIsRecipientExpand] = useState(false);
  const [revokings, setRevokings] = useState<IRevokingDoc[]>();
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    if (chainId && organizationId) {
      fetchRevokingsByQuery(
        ['chainId', 'organizationId', 'vestingId'],
        ['==', '==', '==', '=='],
        [chainId, organizationId, id]
      ).then((res) => {
        if (res) {
          setRevokings(res);
        }
      });
    }
  }, [chainId, organizationId]);

  const getRevoked = (address: string) => {
    return revokings?.find((revoking) => compareAddresses(revoking.data.recipient, address));
  };

  const isFundAvailable = useCallback(() => {
    const fundingTransaction = pendingTransactions.find((transaction) => transaction.data.type === 'FUNDING_CONTRACT');
    return !fundingTransaction;
  }, [pendingTransactions]);

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signerOrProvider: library?.getSigner(0)
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
      return safeTx;
    }
  };

  const initializeStatus = async () => {
    if (
      !vestingContract ||
      vestingContract.data.status === 'INITIALIZED' ||
      (vestingContract.data.status === 'PENDING' && currentSafe?.address)
    ) {
      setStatus('CONTRACT_REQUIRED');
      return;
    }

    if (transaction && transaction.data.safeHash && currentSafe && account) {
      const safeTx = await fetchSafeTransactionFromHash(transaction.data.safeHash);
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signerOrProvider: library?.getSigner(0)
      });
      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const threshold = await safeSdk.getThreshold();

      if (safeTx) {
        setSafeTransaction(safeTx);
        const approvers = transaction.data.approvers ? [...transaction.data.approvers] : [];
        safeTx.signatures.forEach((signature) => {
          if (!approvers.find((approver) => approver === signature.signer)) {
            approvers.push(signature.signer);
          }
        });
        if (approvers.length >= threshold) {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('EXECUTABLE');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'EXECUTABLE'
          });
          setIsExecutableAfterApprove(false);
        } else if (
          safeTx.signatures.has(account.toLowerCase()) ||
          approvers.find((approver) => approver.toLowerCase() === account.toLowerCase())
        ) {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('WAITING_APPROVAL');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'PENDING'
          });
        } else {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('APPROVAL_REQUIRED');
          setVestingsStatus({
            ...vestingsStatus,
            [id]: transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'PENDING'
          });
          if (approvers.length === threshold - 1) {
            setIsExecutableAfterApprove(true);
          }
        }
      }
    } else {
      const VestingContract = new ethers.Contract(
        vestingContract?.data.address || '',
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );

      const TokenContract = new ethers.Contract(
        mintFormState.address,
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

      const tokenBalance = await TokenContract.balanceOf(vestingContract?.data?.address);
      // const tokenBalance = vestingContract.data.balance || 0;

      const numberOfTokensReservedForVesting = await VestingContract.numTokensReservedForVesting();

      if (data.status === 'LIVE') {
        setStatus('SUCCESS');
      } else if (
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
          signerOrProvider: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
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
        if (transaction?.data) {
          await updateTransaction(
            {
              ...transaction.data,
              status: 'SUCCESS'
            },
            data.transactionId
          );
          const batchVestings = vestings.filter((vesting) => vesting.data.transactionId === data.transactionId);
          await Promise.all(
            batchVestings.map(async (vesting) => {
              await updateVesting(
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
        await fetchDashboardData();
        toast.success('Funded successfully.');
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
          mintFormState.address,
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

        const allowance = await tokenContract.allowance(account, vestingContract?.data?.address);
        if (allowance.lt(ethers.utils.parseEther(amount))) {
          const approveTx = await tokenContract.approve(
            vestingContract?.data?.address,
            ethers.utils.parseEther(amount).sub(allowance)
          );
          await approveTx.wait();
        }

        const fundTransaction = await tokenContract.transfer(
          vestingContract?.data?.address,
          ethers.utils.parseEther(amount)
        );
        setTransactionLoaderStatus('IN_PROGRESS');
        await fundTransaction.wait();
        // This should have a function to update the vesting schedule status
        // From INITIALIZED into WAITING_APPROVAL
        await updateVesting(
          {
            ...data,
            status: 'WAITING_APPROVAL',
            updatedAt: Math.floor(new Date().getTime() / 1000)
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
          vestingContract?.data?.address,
          ethers.utils.parseEther(amount)
        ]);
        if (currentSafe?.address && account && chainId && organizationId) {
          if (currentSafe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
            setTransactionLoaderStatus('PENDING');
            const ethAdapter = new EthersAdapter({
              ethers: ethers,
              signerOrProvider: library?.getSigner(0)
            });
            const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
            const safeService = new SafeServiceClient({
              txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
              ethAdapter
            });
            const nextNonce = await safeService.getNextNonce(currentSafe.address);

            const txData = {
              to: mintFormState.address,
              data: transferEncoded,
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
            const transactionId = await createTransaction({
              hash: '',
              safeHash: txHash,
              status: 'PENDING',
              to: vestingContract?.data?.address ?? '',
              type: 'FUNDING_CONTRACT',
              createdAt: Math.floor(new Date().getTime() / 1000),
              updatedAt: Math.floor(new Date().getTime() / 1000),
              organizationId: organizationId,
              approvers: [account],
              fundingAmount: amount,
              chainId
            });
            await updateVesting(
              {
                ...data,
                status: 'WAITING_FUNDS',
                transactionId
              },
              id
            );

            toast.success(`Funding transaction with nonce ${nextNonce} is created successfully`);

            await fetchDashboardData();
            setTransactionLoaderStatus('SUCCESS');
          } else {
            toast.error('You are not a signer of this multisig wallet.');
            return;
          }
        }
      }
      setShowFundingContractModal(false);
    } catch (err) {
      console.log('fundContract - ', err);
      toast.error((err as any).reason ? (err as any).reason : 'Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

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
      const addresses = vestingRecipients.map(({ data: recipient }) => recipient.walletAddress);

      const vestingStartTime = new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis());

      const cliffReleaseDate =
        vesting.details.startDateTime && vesting.details.cliffDuration !== 'no-cliff'
          ? getCliffDateTime(vestingStartTime, vesting.details.cliffDuration)
          : '';
      const cliffReleaseTimestamp = cliffReleaseDate ? Math.floor(cliffReleaseDate.getTime() / 1000) : 0;
      const numberOfReleases =
        vesting.details.startDateTime && vesting.details.endDateTime
          ? getNumberOfReleases(
              vesting.details.releaseFrequency,
              cliffReleaseDate || vestingStartTime,
              new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis())
            )
          : 0;
      const actualStartDateTime = vesting.details.cliffDuration !== 'no-cliff' ? cliffReleaseDate : vestingStartTime;
      const vestingEndTimestamp =
        vesting.details.endDateTime && actualStartDateTime
          ? getChartData({
              start: actualStartDateTime,
              end: new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()),
              cliffDuration: vesting.details.cliffDuration,
              cliffAmount: cliffAmountPerUser,
              frequency: vesting.details.releaseFrequency,
              vestedAmount: vestingAmountPerUser
            }).projectedEndDateTime
          : // getProjectedEndDateTime(
            //     actualStartDateTime,
            //     new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()),
            //     numberOfReleases,
            //     vesting.details.releaseFrequency
            //   )
            null;
      const vestingStartTimestamps = new Array(totalRecipients).fill(
        cliffReleaseTimestamp
          ? cliffReleaseTimestamp
          : Math.floor((vesting.details.startDateTime as unknown as Timestamp).seconds)
      );
      const vestingEndTimestamps = new Array(totalRecipients).fill(Math.floor(vestingEndTimestamp!.getTime() / 1000));
      const vestingCliffTimestamps = new Array(totalRecipients).fill(cliffReleaseTimestamp);
      const releaseFrequencyTimestamp = getReleaseFrequencyTimestamp(
        vestingStartTime,
        vestingEndTimestamp!,
        vesting.details.releaseFrequency,
        vesting.details.cliffDuration
      );
      const vestingReleaseIntervals = new Array(totalRecipients).fill(releaseFrequencyTimestamp);
      const vestingLinearVestAmounts = vestingRecipients.map(({ data: recipient }) => {
        const { cliffDuration, lumpSumReleaseAfterCliff } = vesting.details;
        // Computes how many tokens are left after cliff based on percentage
        const percentage = 1 - (cliffDuration !== 'no-cliff' ? +lumpSumReleaseAfterCliff : 0) / 100;
        return parseTokenAmount(Number(recipient.allocations) * percentage, 18);
      });
      const vestingCliffAmounts = new Array(totalRecipients).fill(parseTokenAmount(cliffAmountPerUser, 18));

      const CREATE_CLAIMS_BATCH_FUNCTION =
        'function createClaimsBatch(address[] memory _recipients, uint40[] memory _startTimestamps, uint40[] memory _endTimestamps, uint40[] memory _cliffReleaseTimestamps, uint40[] memory _releaseIntervalsSecs, uint112[] memory _linearVestAmounts, uint112[] memory _cliffAmounts)';
      const CREATE_CLAIMS_BATCH_INTERFACE =
        'createClaimsBatch(address[],uint40[],uint40[],uint40[],uint40[],uint112[],uint112[])';
      const ABI = [CREATE_CLAIMS_BATCH_FUNCTION];
      const vestingContractInterface = new ethers.utils.Interface(ABI);
      const createClaimsBatchEncoded = vestingContractInterface.encodeFunctionData('createClaimsBatch', [
        addresses,
        vestingStartTimestamps,
        vestingEndTimestamps,
        vestingCliffTimestamps,
        vestingReleaseIntervals,
        vestingLinearVestAmounts,
        vestingCliffAmounts
      ]);
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
          signerOrProvider: library?.getSigner(0)
        });
        setTransactionLoaderStatus('PENDING');
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });

        const nextNonce = await safeService.getNextNonce(currentSafe.address);
        const txData = {
          to: vestingContract?.data?.address ?? '',
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
          const transactionId = await createTransaction({
            hash: '',
            safeHash: txHash,
            status: 'PENDING',
            to: vestingContract?.data?.address ?? '',
            type: 'ADDING_CLAIMS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId,
            chainId,
            vestingIds: [vestingId],
            approvers: [account]
          });
          await updateVesting(
            {
              ...data,
              // Because all batched vesting schedules are now ready for distribution
              transactionId,
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
          vestingContract?.data?.address ?? '',
          VTVL_VESTING_ABI.abi,
          library.getSigner()
        );
        const addingClaimsTransaction = await vestingContractInstance.createClaimsBatch(
          addresses,
          vestingStartTimestamps,
          vestingEndTimestamps,
          vestingCliffTimestamps,
          vestingReleaseIntervals,
          vestingLinearVestAmounts,
          vestingCliffAmounts
        );
        setTransactionLoaderStatus('IN_PROGRESS');
        const transactionData: ITransaction = {
          hash: addingClaimsTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: vestingContract?.data?.address ?? '',
          type: 'ADDING_CLAIMS',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds: [vestingId]
        };
        const transactionId = await createTransaction(transactionData);
        // Wait for the transaction first
        await addingClaimsTransaction.wait();
        // Update everything else in the DB
        await updateVesting(
          {
            ...vesting,
            transactionId,
            // Because the schedule is now confirmed and ready for the vesting
            status: 'LIVE'
          },
          vestingId
        );
        await updateTransaction(
          {
            ...transactionData,
            status: 'SUCCESS',
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          transactionId
        );
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
          signerOrProvider: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.data?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(transaction?.data?.safeHash as string));
        await updateTransaction(
          {
            ...transaction.data,
            approvers: transaction.data.approvers ? [...transaction.data.approvers, account] : [account]
          },
          transaction.id
        );
        toast.success('Approved successfully.');
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
          signerOrProvider: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
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
        if (transaction.data) {
          await updateTransaction(
            {
              ...transaction.data,
              status: 'SUCCESS'
            },
            data.transactionId
          );
          const batchVestings = await fetchVestingsByQuery(
            ['transactionId', 'chainId'],
            ['==', '=='],
            [transaction.id, chainId]
          );
          const activeBatchVestings = batchVestings.filter((bv) => !bv.data.archive);

          await Promise.all(
            activeBatchVestings.map(async (vesting) => {
              await updateVesting(
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

  const handleApproveAndExecuteTransaction = async () => {
    await handleApproveTransaction();
    await handleExecuteTransaction();
  };

  const handleApproveAndExecuteFundingTransaction = async () => {
    await handleApproveTransaction();
    await handleExecuteFundingTransaction();
  };

  useEffect(() => {
    if (transactions.length) {
      initializeStatus();
    } else {
      setStatus('FUNDING_REQUIRED');
      setTransactionStatus('INITIALIZE');
    }
  }, [data, currentSafe, account, vestingContract, transactions, transaction]);

  const CellCliff = () => {
    const newValue = data.details.cliffDuration.replace('-', ' ');
    return newValue.charAt(0).toUpperCase() + newValue.substring(1, newValue.length);
  };

  const getPeriod = () => {
    return (
      data.details.startDateTime &&
      data.details.endDateTime &&
      getDuration(
        new Date((data.details.startDateTime as unknown as Timestamp).seconds * 1000),
        new Date((data.details.endDateTime as unknown as Timestamp).seconds * 1000)
      )
    );
  };

  const handleRevoke = async (recipient: string) => {
    const signer = library?.getSigner(0);
    const vestingAddress = vestingContracts.find((v) => v.id === data.vestingContractId)?.data.address;
    if (!signer || !account || !chainId || !vestingAddress) return;

    if (data.status === 'COMPLETED' || data.status === 'LIVE') {
      try {
        setTransactionLoaderStatus('IN_PROGRESS');
        if (currentSafe?.address) {
          if (!isAdmin) {
            toast.error(
              "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
            );
            return;
          }

          const vestingContractInterface = new ethers.utils.Interface([REVOKE_CLAIM_FUNCTION_ABI]);

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

          const transactionID = await createTransaction({
            hash: '',
            safeHash,
            chainId: data.chainId,
            organizationId: data.organizationId,
            vestingIds: [id],
            to: vestingAddress,
            status: 'PENDING',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            type: 'REVOKE_CLAIM'
          });

          await createRevoking({
            vestingId: id,
            recipient,
            transactionId: transactionID ?? '',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            chainId,
            organizationId: organizationId!,
            status: 'PENDING'
          });

          toast.success(`Revoking transaction with nonce ${nonce} has been created successfully.`);
        } else {
          const vestingContractInstance = new ethers.Contract(
            vestingAddress,
            VTVL_VESTING_ABI.abi,
            library.getSigner()
          );
          const revokeTransaction = await vestingContractInstance.revokeClaim(recipient);

          await revokeTransaction.wait();
          const transactionID = await createTransaction({
            hash: revokeTransaction.hash,
            safeHash: '',
            chainId: data.chainId,
            organizationId: data.organizationId,
            vestingIds: [id],
            to: vestingAddress,
            status: 'SUCCESS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            type: 'REVOKE_CLAIM'
          });
          await createRevoking({
            vestingId: id,
            recipient,
            transactionId: transactionID ?? '',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            chainId,
            organizationId: organizationId!,
            status: 'SUCCESS'
          });
          toast.success('Revoking is done successfully.');
        }
        setRevoked(true);
        setTransactionLoaderStatus('SUCCESS');
      } catch (err) {
        console.log('handleRevoke - ', err);
        toast.error('Something went wrong. Try agaiin later.');
        setTransactionLoaderStatus('ERROR');
      }
    }
  };

  const getRecipientInfo = useCallback(
    (wallet: string) => {
      return vestingSchedulesInfo.find((vestingInfo) => compareAddresses(vestingInfo.recipient, wallet));
    },
    [vestingSchedulesInfo]
  );

  // const formatValue = (value: BigNumber | undefined) => {
  //   return value ? Number(formatEther(value)).toFixed(2) : 0;
  // };
  const formatValue = (value: BigNumber | undefined) => {
    return value ? formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(value)))) : '0';
  };

  return (
    <>
      <div className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd]">
        <div className="flex items-center w-16 py-3"></div>
        <div className="flex items-center w-36 py-3">{data.name}</div>
        <div className="flex items-center w-52 py-3">
          {!!status && status !== 'SUCCESS' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
              <WarningIcon className="w-3 h-3" />
              {STATUS_MAPPING[status]}
            </div>
          )}
        </div>
        <div className="flex items-center w-52 py-3">{CellCliff()}</div>
        <div className="flex items-center w-40 py-3">{getPeriod()}</div>
        <div className="flex items-center w-32 py-3"></div>
        <div className="flex items-center w-40 py-3">{formatNumber(data.details.amountToBeVested)}</div>
        <div className="flex items-center min-w-[350px] flex-grow py-3">
          {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'INITIALIZE' && (
            <button
              className="secondary small whitespace-nowrap"
              onClick={handleCreateSignTransaction}
              disabled={transactionLoaderStatus === 'IN_PROGRESS'}>
              Create &amp; sign
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
          {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'EXECUTABLE' && (
            <button
              className="secondary small whitespace-nowrap"
              onClick={handleExecuteTransaction}
              disabled={transactionLoaderStatus === 'IN_PROGRESS'}>
              Execute
            </button>
          )}
          {status === 'FUNDING_REQUIRED' && transactionStatus === 'INITIALIZE' && (
            <button
              className="secondary small whitespace-nowrap"
              disabled={transactionLoaderStatus === 'IN_PROGRESS'}
              onClick={() => {
                setShowFundingContractModal(true);
              }}>
              Fund Contract
            </button>
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
      <div className="flex bg-[#eaecf0] text-[#667085] text-xs border-t border-[#d0d5dd] font-semibold">
        <div className="flex items-center w-16 py-3"></div>
        <div className="flex items-center w-36 py-3">
          Recipient
          <div
            className="avatar 
                   bg-gray-500 text-gray-100  w-5 h-5 ml-3">
            {vestingRecipients.length}
          </div>
        </div>
        <div className="flex items-center w-52 py-3">Address</div>
        <div className="flex items-center w-52 py-3">Withdrawn</div>
        <div className="flex items-center w-40 py-3">Unclaimed</div>
        <div className="flex items-center w-32 py-3">Total locked</div>
        <div className="flex items-center w-40 py-3">Allocation</div>
        <div className="flex items-center w-40 py-3">Status</div>
        <div className="flex items-center w-40 py-3"></div>
      </div>

      {vestingRecipients.map(({ data: recipient }, index) => {
        if (index < 3 || isRecipientExpand) {
          return (
            <div
              key={recipient.walletAddress}
              className="flex  bg-[#eaecf0] text-[#667085] text-xs border-t border-[#d0d5dd]">
              <div className="flex items-center w-16 py-3"></div>
              <div className="flex items-center w-36 py-3">{recipient.name}</div>
              <div className="flex items-center w-52 py-3">
                <Copy text={recipient.walletAddress}>
                  <p className="paragraphy-small ">
                    {recipient.walletAddress.slice(0, 5)}...{recipient.walletAddress.slice(-4)}
                  </p>
                </Copy>
              </div>
              <div className="flex items-center w-52 py-3">
                {formatValue(getRecipientInfo(recipient.walletAddress)?.withdrawn)}
              </div>
              <div className="flex items-center w-40 py-3">
                {formatValue(getRecipientInfo(recipient.walletAddress)?.unclaimed)}
              </div>
              <div className="flex items-center w-32 py-3">
                {formatValue(getRecipientInfo(recipient.walletAddress)?.locked)}
              </div>
              <div className="flex items-center w-40 py-3">
                {formatValue(getRecipientInfo(recipient.walletAddress)?.allocation)}
              </div>
              <div className="flex items-center w-40 py-3">
                {getRevoked(recipient.walletAddress) &&
                  getRevoked(recipient.walletAddress)?.data.status === 'SUCCESS' && (
                    <Chip
                      rounded
                      className="text-xs"
                      label={`Revoked on ${format(
                        new Date((getRevoked(recipient.walletAddress) as IRevokingDoc).data.updatedAt * 1000),
                        'dd MMM yyyy'
                      )}`}
                      color="dangerAlt"
                    />
                  )}
              </div>
              <div className="flex items-center w-40 py-3">
                {(!getRevoked(recipient.walletAddress) ||
                  getRevoked(recipient.walletAddress)?.data.status === 'PENDING') &&
                  data.status === 'LIVE' && (
                    <Button
                      disabled={getRevoked(recipient.walletAddress)?.data.status === 'PENDING' || revoked}
                      danger
                      size="small"
                      label={`${revoked ? 'Revoked' : 'Revoke'}`}
                      onClick={() => handleRevoke(recipient.walletAddress)}
                    />
                  )}
              </div>
            </div>
          );
        } else {
          return null;
        }
      })}
      {vestingRecipients.length > 3 && (
        <div className="flex  bg-[#eaecf0] text-[#667085] text-xs border-t border-[#d0d5dd]">
          <div className="flex items-center w-16 py-3"></div>
          <div
            className="flex items-center w-36 py-3 text-[#1b369a] underline cursor-pointer"
            onClick={() => setIsRecipientExpand(!isRecipientExpand)}>
            {isRecipientExpand ? 'Hide ....' : 'View more...'}
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleTable;
