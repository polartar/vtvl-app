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
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { fetchVestingsByQuery, updateVesting } from 'services/db/vesting';
// import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction, IVesting } from 'types/models';
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getNumberOfReleases,
  getReleaseFrequencyTimestamp
} from 'utils/vesting';

const VestingSchedulePendingAction: React.FC<{ id: string; data: IVesting }> = ({ id, data }) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  const {
    // fetchDashboardVestingContract,
    vestingContracts,
    transactions,
    // fetchDashboardTransactions,
    fetchDashboardData,
    vestings
  } = useDashboardContext();
  const {
    pendingTransactions,
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

  const [status, setStatus] = useState<IStatus>('');

  const [transactionStatus, setTransactionStatus] = useState<
    'INITIALIZE' | 'EXECUTABLE' | 'WAITING_APPROVAL' | 'APPROVAL_REQUIRED' | ''
  >('');
  const [showFundingContractModal, setShowFundingContractModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  const isFundAvailable = useCallback(() => {
    const fundingTransaction = pendingTransactions.find((transaction) => transaction.data.type === 'FUNDING_CONTRACT');
    return !fundingTransaction;
  }, [pendingTransactions]);

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (safe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
      (vestingContract.data.status === 'PENDING' && safe?.address)
    ) {
      setStatus('CONTRACT_REQUIRED');
      return;
    }

    if (transaction && transaction.data.safeHash && safe && account) {
      const safeTx = await fetchSafeTransactionFromHash(transaction.data.safeHash);

      if (safeTx) {
        setSafeTransaction(safeTx);
        if (safeTx.signatures.size >= safe?.threshold) {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('EXECUTABLE');
        } else if (safeTx.signatures.has(account.toLowerCase())) {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('WAITING_APPROVAL');
        } else {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('APPROVAL_REQUIRED');
        }
      }
    } else {
      // const TokenContract = new ethers.Contract(
      //   mintFormState.address,
      //   [
      //     // Read-Only Functions
      //     'function balanceOf(address owner) view returns (uint256)',
      //     'function decimals() view returns (uint8)',
      //     'function symbol() view returns (string)',
      //     // Authenticated Functions
      //     'function transfer(address to, uint amount) returns (bool)',
      //     // Events
      //     'event Transfer(address indexed from, address indexed to, uint amount)'
      //   ],
      //   ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      // );
      const VestingContract = new ethers.Contract(
        vestingContract?.data.address || '',
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );

      // const tokenBalance = await TokenContract.balanceOf(vestingContract?.data?.address);
      const tokenBalance = vestingContract.data.balance || 0;

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
      } else {
        setStatus('AUTHORIZATION_REQUIRED');
        setTransactionStatus('INITIALIZE');
      }
    }
  };

  const handleExecuteFundingTransaction = async () => {
    try {
      setIsCloseAvailable(true);
      if (safe?.address && chainId && safeTransaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
        if (safe?.address && account && chainId && organizationId) {
          if (safe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
            setTransactionLoaderStatus('PENDING');
            const ethAdapter = new EthersAdapter({
              ethers: ethers,
              signer: library?.getSigner(0)
            });
            const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
            const txData = {
              to: mintFormState.address,
              data: transferEncoded,
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
            const transactionId = await createTransaction({
              hash: '',
              safeHash: txHash,
              status: 'PENDING',
              to: vestingContract?.data?.address ?? '',
              type: 'FUNDING_CONTRACT',
              createdAt: Math.floor(new Date().getTime() / 1000),
              updatedAt: Math.floor(new Date().getTime() / 1000),
              organizationId: organizationId,
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
            await fetchDashboardData();
            setTransactionLoaderStatus('SUCCESS');
          } else {
            toast.error('You are not a signer of this multisig wallet.');
            return;
          }
        }
      }
      setShowFundingContractModal(false);
    } catch (err: any) {
      console.log('fundContract - ', err);
      toast.error(err.reason ? err.reason : 'Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleCreateSignTransaction = async () => {
    try {
      if (!account || !library) {
        activate(injected);
        return;
      }
      const vesting = data;
      const vestingId = id;
      const cliffAmountPerUser =
        getCliffAmount(
          vesting.details.cliffDuration,
          +vesting.details.lumpSumReleaseAfterCliff,
          +vesting.details.amountToBeVested
        ) / vesting.recipients.length;
      const vestingAmountPerUser = +vesting.details.amountToBeVested / vesting.recipients.length - cliffAmountPerUser;
      const addresses = vesting.recipients.map((recipient) => recipient.walletAddress);

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
      const vestingStartTimestamps = new Array(vesting.recipients.length).fill(
        cliffReleaseTimestamp
          ? cliffReleaseTimestamp
          : Math.floor((vesting.details.startDateTime as unknown as Timestamp).seconds)
      );
      const vestingEndTimestamps = new Array(vesting.recipients.length).fill(
        Math.floor(vestingEndTimestamp!.getTime() / 1000)
      );
      const vestingCliffTimestamps = new Array(vesting.recipients.length).fill(cliffReleaseTimestamp);
      const releaseFrequencyTimestamp = getReleaseFrequencyTimestamp(
        vestingStartTime,
        vesting.details.releaseFrequency
      );
      const vestingReleaseIntervals = new Array(vesting.recipients.length).fill(releaseFrequencyTimestamp);
      const vestingLinearVestAmounts = new Array(vesting.recipients.length).fill(
        parseTokenAmount(vestingAmountPerUser, 18)
      );
      const vestingCliffAmounts = new Array(vesting.recipients.length).fill(parseTokenAmount(cliffAmountPerUser, 18));

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
      if (safe?.address && account && chainId && organizationId) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        setTransactionLoaderStatus('PENDING');
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const txData = {
          to: vestingContract?.data?.address ?? '',
          data: createClaimsBatchEncoded,
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
            vestingIds: [vestingId]
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
          await fetchDashboardData();
        }
        toast.success('Transaction has been created successfully.');
        setTransactionLoaderStatus('SUCCESS');
      } else if (account && chainId && organizationId) {
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
        await updateVesting(
          {
            ...vesting,
            transactionId,
            // Because the schedule is now confirmed and ready for the vesting
            status: 'LIVE'
          },
          vestingId
        );
        await addingClaimsTransaction.wait();
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
        toast.success('Added schedules successfully.');
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
      if (safe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.hash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.data?.hash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(transaction?.data?.hash as string));
        await fetchDashboardData();
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
      if (safe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
        toast.success('Revoking is done successfully.');
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  useEffect(() => {
    if (transactions.length) {
      initializeStatus();
    } else {
      setStatus('FUNDING_REQUIRED');
      setTransactionStatus('INITIALIZE');
    }
  }, [data, safe, account, vestingContract, transactions, transaction]);

  return status === 'SUCCESS' ? null : (
    <div className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd]">
      <div className="flex items-center w-16 py-3"></div>
      <div className="flex items-center w-36 py-3">{data.name}</div>
      <div className="flex items-center w-52 py-3">Vesting Schedule</div>
      <div className="flex items-center w-52 py-3">
        {!!status && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3">{vestingContract?.data.name}</div>
      <div className="flex items-center w-32 py-3">
        <div className="flex gap-1.5 items-center">
          <img className="w-4 h-4" src="icons/safe.png" />
          Founders
        </div>
      </div>
      <div className="flex items-center w-40 py-3">{formatNumber(data.details.amountToBeVested)}</div>
      <div className="flex items-center min-w-[200px] flex-grow py-3">
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'INITIALIZE' && (
          <button
            className="secondary small whitespace-nowrap"
            onClick={handleCreateSignTransaction}
            disabled={transactionLoaderStatus === 'IN_PROGRESS'}>
            Create & sign
          </button>
        )}
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'WAITING_APPROVAL' && (
          <button className="secondary small whitespace-nowrap" disabled>
            Waiting approval
          </button>
        )}
        {status === 'AUTHORIZATION_REQUIRED' && transactionStatus === 'APPROVAL_REQUIRED' && (
          <button className="secondary small whitespace-nowrap" onClick={handleApproveTransaction}>
            Approve
          </button>
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
            disabled={transactionLoaderStatus === 'IN_PROGRESS' || !isFundAvailable()}
            onClick={() => {
              setShowFundingContractModal(true);
            }}>
            Fund Contract
          </button>
        )}
        {status === 'FUNDING_REQUIRED' && transactionStatus === 'APPROVAL_REQUIRED' && (
          <button
            className="secondary small whitespace-nowrap"
            onClick={() => {
              setShowFundingContractModal(true);
            }}>
            Approve Funding
          </button>
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
  );
};

export default VestingSchedulePendingAction;