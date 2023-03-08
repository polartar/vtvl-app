import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { BigNumber, ethers } from 'ethers';
import { Timestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import { vestingCollection, vestingContractCollection } from 'services/db/firestore';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { fetchRevokingsByQuery } from 'services/db/revoking';
import { fetchTransactionsByQuery } from 'services/db/transaction';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { fetchVestingContractByQuery, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipient, IRevoking, ITransaction, IVesting, IVestingContract } from 'types/models';
import { IRecipientForm } from 'types/models/recipient';
import { TCapTableRecipientTokenDetails } from 'types/models/token';
import { compareAddresses } from 'utils';
import { getRecipient } from 'utils/recipients';
import { parseTokenAmount } from 'utils/token';

import { useAuthContext } from './auth.context';
import { useLoaderContext } from './loader.context';
import { useSharedContext } from './shared.context';
import { useTokenContext } from './token.context';

type IVestingStatus = 'FUNDING_REQUIRED' | 'PENDING' | 'EXECUTABLE' | 'LIVE';

interface IDashboardData {
  vestings: { id: string; data: IVesting }[];
  revokings: { id: string; data: IRevoking }[];
  recipients: MultiValue<IRecipientForm>;
  vestingContracts: { id: string; data: IVestingContract }[];
  transactions: { id: string; data: ITransaction }[];
  ownershipTransfered: boolean;
  insufficientBalance: boolean;
  depositAmount: string;
  vestingsLoading: boolean;
  vestingContractLoading: boolean;
  transactionsLoading: boolean;
  removeOwnership: boolean;
  vestingsStatus: { [key: string]: IVestingStatus };
  totalAllocation: ethers.BigNumber;
  totalWithdrawn: ethers.BigNumber;
  totalClaimable: ethers.BigNumber;
  claims: number;
  recipientTokenDetails: TCapTableRecipientTokenDetails[];
  // fetchDashboardVestingContract: () => void;
  fetchDashboardVestings: () => void;
  fetchDashboardTransactions: () => void;
  setOwnershipTransfered: (v: boolean) => void;
  fetchDashboardData: () => void;
  setRemoveOwnership: (v: boolean) => void;
  setVestingsStatus: (v: { [key: string]: IVestingStatus }) => void;
}

const DashboardContext = createContext({} as IDashboardData);

export function DashboardContextProvider({ children }: any) {
  const { account, chainId, library } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { organizationId, safe } = useAuthContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const router = useRouter();

  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);
  const [revokings, setRevokings] = useState<{ id: string; data: IRevoking }[]>([]);
  const [vestingContracts, setVestingContracts] = useState<{ id: string; data: IVestingContract }[]>([]);
  const [transactions, setTransactions] = useState<{ id: string; data: ITransaction }[]>([]);
  const [ownershipTransfered, setOwnershipTransfered] = useState(false);
  const [removeOwnership, setRemoveOwnership] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [vestingsLoading, setVestingsLoading] = useState(false);
  const [vestingContractLoading, setVestingContractLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [recipients, setRecipients] = useState<MultiValue<IRecipientForm>>([]);
  const [vestingsStatus, setVestingsStatus] = useState<{ [key: string]: IVestingStatus }>({});

  // Stores everything about the user token details
  // Used to compute total withdrawn, unclaimed, total allocations etc.
  const [totalAllocation, setTotalAllocation] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [totalWithdrawn, setTotalWithdrawn] = useState(ethers.BigNumber.from(0));
  const [totalClaimable, setTotalClaimable] = useState(ethers.BigNumber.from(0));
  const [claims, setClaims] = useState(0);
  const [recipientTokenDetails, setRecipientTokenDetails] = useState<TCapTableRecipientTokenDetails[]>([]);

  /**
   * This function is intended to initialize the multicall function
   * Will compute all the total amounts for
   * - Withdrawn
   * - Claimable tokens
   * - Total allocation
   * This will also map out all the recipients that has allocations and all their token details
   */
  const initializeMulticall = async () => {
    // Start to check for all the required states before doing anything
    if (
      vestingContracts.length &&
      chainId &&
      mintFormState &&
      mintFormState.address &&
      vestings.length &&
      recipients.length
    ) {
      // Get the list of wallet addresses
      let recipientAddresses = vestings.reduce((res, vesting) => {
        res = [...res, ...vesting.data.recipients.map((recipient) => recipient.walletAddress)];
        return res;
      }, [] as string[]);
      recipientAddresses = recipientAddresses.filter(
        (address, index) => recipientAddresses.findIndex((addr) => addr === address) === index
      );

      const multicall = new Multicall({
        ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
        tryAggregate: true
      });

      // Setup multicall
      const contractCallContext: ContractCallContext[] = vestingContracts.reduce((res, vestingContract, index) => {
        // Ensure that what we add in the call has vesting contract address
        if (vestingContract && vestingContract.data && vestingContract.data.address) {
          const vestingSchedule = vestings.find((schedule) => schedule.data.vestingContractId === vestingContract.id);
          if (vestingSchedule) {
            console.log('Schedule found', vestingSchedule, recipientAddresses);
            res = [
              ...res,
              ...recipientAddresses.map((recipient) => ({
                // Attach the contract address, recipient wallet and schedule ID
                reference: `multicall-${vestingContract.data.address}-${recipient}-${vestingSchedule?.id}`,
                contractAddress: vestingContract.data.address,
                abi: VTVL_VESTING_ABI.abi,
                calls: [
                  {
                    // This gets the claimable amount by the recipient
                    reference: 'claimableAmount',
                    methodName: 'claimableAmount',
                    methodParameters: [recipient]
                  },
                  {
                    // This gets the total vested amount for the recipient (includes everything)
                    reference: 'finalVestedAmount',
                    methodName: 'finalVestedAmount',
                    methodParameters: [recipient]
                  },
                  {
                    // This gets the current vested amount as of date (currently unlocked tokens, both claimed and unclaimed)
                    reference: 'vestedAmount',
                    methodName: 'vestedAmount',
                    methodParameters: [recipient, getUnixTime(new Date())]
                  }
                ]
              }))
            ];
          }
        }
        return res;
      }, [] as ContractCallContext[]);

      // Initialize the recipients for the cap table
      const recipientsTokenDetails: TCapTableRecipientTokenDetails[] = [];

      // Call the multicall feature
      const multicallResponse = await multicall.call(contractCallContext);
      try {
        if (multicallResponse) {
          const res = multicallResponse;
          console.log('MULTICALL RESPONSE', res);
          // Set constants for referencing the calls based on the multicall setup above
          const CLAIMABLE_AMOUNT_CALL = 0;
          const FINAL_VESTED_AMOUNT_CALL = 1;
          const VESTED_AMOUNT_CALL = 2;

          // Set the default values for the totals
          let claimedCount = 0;
          let totalAllocationAmount = ethers.BigNumber.from(0);
          let totalWithdrawnAmount = ethers.BigNumber.from(0);
          let totalClaimableAmount = ethers.BigNumber.from(0);

          Object.keys(res.results).forEach((key, index) => {
            const record = res.results[key].callsReturnContext;
            // Gets the claimable amount of the recipient
            const claimableAmount = record[CLAIMABLE_AMOUNT_CALL].returnValues[0];
            // Gets the total allocation of the recipient
            const finalVestedAmount = record[FINAL_VESTED_AMOUNT_CALL].returnValues[0];
            // Gets the vested amount of the recipient -- which is the claimed and unclaimed tokens
            const vestedAmount = record[VESTED_AMOUNT_CALL].returnValues[0];
            // Computes the actual withdrawn amount by getting the claimed tokens
            // unclaimed = claimableAmount
            // claimed = vested amount - unclaimed
            const claimedAmount = ethers.BigNumber.from(vestedAmount).gt(claimableAmount)
              ? ethers.BigNumber.from(vestedAmount).sub(claimableAmount)
              : ethers.BigNumber.from(0);

            // Computes the locked tokens of the recipient
            const lockedTokens = ethers.BigNumber.from(finalVestedAmount).sub(claimedAmount).sub(claimableAmount);

            totalClaimableAmount = totalClaimableAmount.add(claimableAmount);
            totalAllocationAmount = totalAllocationAmount.add(finalVestedAmount);
            totalWithdrawnAmount = totalWithdrawnAmount.add(claimedAmount);
            if (claimedAmount.gt(ethers.BigNumber.from(0))) claimedCount++;

            // Setting up the recipient details based on wallet address from the multicall result
            const wallet = key.split('-')[2]; // contains the wallet address from `multicall-[0xContractAddress]-[0xWalletAddress]`
            const scheduleId = key.split('-')[3]; // contains the schedule id from multicall reference
            // Get the recipient details
            const currentRecipient = recipients.find((recipient) => recipient.walletAddress === wallet);
            // Only add it in if the recipient on a particular vesting contract and schedule has vested allocation.
            if (currentRecipient && ethers.BigNumber.from(finalVestedAmount).gt(0)) {
              recipientsTokenDetails.push({
                scheduleId,
                name: currentRecipient.name,
                company: currentRecipient.company ?? '',
                // Some data especially on the recipients collection saves the recipientType as string ie., 'employee', 'founder', etc.
                // while in the old one, it uses the select components values ie [{ label: 'Employee', value: 'employee' }] etc.
                recipientType:
                  typeof currentRecipient.recipientType === 'string'
                    ? currentRecipient.recipientType
                    : String(currentRecipient.recipientType[0]?.label),
                address: currentRecipient.walletAddress,
                // Ensure that the totalAllocation for each recipient is divided by the number of recipients
                totalAllocation: finalVestedAmount,
                // Set recipient's claimed and unclaimed datas
                claimed: claimedAmount,
                unclaimed: claimableAmount,
                lockedTokens
              });
            }
          });

          setClaims(claimedCount);
          setTotalAllocation(totalAllocationAmount);
          setTotalWithdrawn(totalWithdrawnAmount);
          setTotalClaimable(totalClaimableAmount);
        } else {
          throw multicallResponse;
        }
      } catch (err) {
        console.log('Error on multicall', err);
      }

      setRecipientTokenDetails([...recipientsTokenDetails]);
    }
  };

  useEffect(() => {
    initializeMulticall();
  }, [chainId, vestingContracts, mintFormState, vestings, recipients]);

  useEffect(() => {
    if (!organizationId) return;
    let tmpVestingContracts: { id: string; data: IVestingContract }[] = [];
    const q = query(vestingContractCollection, where('organizationId', '==', organizationId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const vestingContractInfo = change.doc.data();

        if (change.type === 'added') {
          tmpVestingContracts.push({
            id: change.doc.id,
            data: vestingContractInfo
          });
        } else if (change.type === 'modified') {
          tmpVestingContracts = tmpVestingContracts.map((vesting) => {
            if (vesting.id === change.doc.id) {
              return {
                id: vesting.id,
                data: vestingContractInfo
              };
            }
            return vesting;
          });
          setVestingContracts(tmpVestingContracts.slice());
        }
      });
      setVestingContracts(tmpVestingContracts);
    });

    return () => {
      unsubscribe();
    };
  }, [organizationId]);

  const fetchDashboardVestings = async () => {
    setVestingsLoading(true);
    try {
      const res = await fetchVestingsByQuery(['organizationId', 'chainId'], ['==', '=='], [organizationId!, chainId!]);
      // Filter out without the archived records
      const filteredVestingSchedules = res.filter(
        (v) => !v.data.archive && v.data.status !== 'REVOKED' && v.data.chainId === chainId
      );
      setVestings(filteredVestingSchedules);
    } catch (err) {
      console.log('fetchDashboardVestings - ', err);
    }
    setVestingsLoading(false);
  };

  const fetchDashboardRevokings = async () => {
    try {
      const res = await fetchRevokingsByQuery(
        ['organizationId', 'chainId', 'status'],
        ['==', '==', '=='],
        [organizationId!, chainId!, 'PENDING']
      );
      setRevokings(res);
    } catch (err) {
      console.log('fetchDashboardRevokings - ', err);
    }
  };

  const fetchDashboardTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const res = await fetchTransactionsByQuery(
        ['organizationId', 'chainId'],
        ['==', '=='],
        [organizationId!, chainId!]
      );
      setTransactions(res);
    } catch (err) {
      console.log('fetchDashboardTransactions - ', err);
    }
    setTransactionsLoading(false);
  };

  const fetchDashboardData = async () => {
    if (organizationId && chainId) {
      showLoading();
      try {
        await fetchDashboardVestings();
        // await fetchDashboardVestingContract();
        await fetchDashboardTransactions();
        await fetchDashboardRevokings();
      } catch (err) {
        console.log('fetchDashboardData - ', err);
        setVestings([]);
        setTransactions([]);
      }
      hideLoading();
    } else {
      setVestings([]);
      setTransactions([]);
      setRevokings([]);
    }
  };

  const value = useMemo(
    () => ({
      vestings,
      revokings,
      recipients,
      vestingContracts,
      transactions,
      ownershipTransfered,
      insufficientBalance,
      depositAmount,
      vestingsLoading,
      vestingContractLoading,
      transactionsLoading,
      removeOwnership,
      vestingsStatus,
      totalAllocation,
      totalWithdrawn,
      totalClaimable,
      claims,
      recipientTokenDetails,
      // fetchDashboardVestingContract,
      fetchDashboardVestings,
      fetchDashboardTransactions,
      setOwnershipTransfered,
      fetchDashboardData,
      setRemoveOwnership,
      setVestingsStatus
    }),
    [
      vestings,
      recipients,
      transactions,
      ownershipTransfered,
      insufficientBalance,
      depositAmount,
      vestingsLoading,
      vestingContractLoading,
      transactionsLoading,
      removeOwnership,
      vestingContracts,
      revokings,
      vestingsStatus,
      totalAllocation,
      totalWithdrawn,
      totalClaimable,
      claims,
      recipientTokenDetails
    ]
  );

  useEffect(() => {
    if (chainId && (organizationId || (router && router.pathname === '/dashboard'))) fetchDashboardData();
  }, [organizationId, router, chainId]);

  useEffect(() => {
    if (!vestings) {
      return;
    }

    const vestingIds: string[] = [];
    vestings.forEach((vesting) => {
      vestingIds.push(vesting.id);
    });

    // Run only when there are vestingIds present
    if (vestingIds && vestingIds.length) {
      console.log('DASHBOARD LOADING?');
      showLoading();
      // Firebase limits the IN operator into 10, so we have to batch it by 10s
      const splicedVestingIds = [...vestingIds];
      const batches = [];

      // We loop as long as the new array for the vestingIds has items
      while (splicedVestingIds.length) {
        // Get only the first 10 of the remaining spliced vestingIds
        const batch = splicedVestingIds.splice(0, 10);
        // Add the 10 items into the query for the batch
        batches.push(
          fetchRecipientsByQuery(['vestingId'], ['in'], [[...batch]])
            .then((allRecipients) => {
              const recipientsData = allRecipients
                .filter(
                  (recipient, i) =>
                    i ===
                    allRecipients.findIndex((r) => compareAddresses(r.data.walletAddress, recipient.data.walletAddress))
                )
                .map(
                  (recipient) =>
                    ({
                      walletAddress: recipient.data.walletAddress,
                      name: recipient.data.name,
                      email: recipient.data.email,
                      company: recipient.data.company ?? '',
                      allocations: Number(recipient.data.allocations),
                      recipientType: [getRecipient(recipient.data.recipientType)]
                    } as IRecipientForm)
                );
              return recipientsData;
            })
            .catch((error) => {
              console.error('Fetching recipients data error', error);
            })
        );
      }

      // Execute all the batches and update the recipients state
      Promise.all(batches)
        .then((result) => {
          // Gets the sublist of the batch list and flat them out into a single array
          const allRecipientsData = result.flat() as IRecipientForm[];
          setRecipients(allRecipientsData);
        })
        .finally(() => {
          hideLoading();
        });
    }

    if (!organizationId) return;
    const q = query(vestingCollection, where('organizationId', '==', organizationId));
    const subscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const vestingInfo = change.doc.data();
          if (vestingInfo.status === 'LIVE') {
            const newVestings = vestings.map((vesting) => {
              if (vesting.id === change.doc.id) {
                toast.success('Added schedules successfully.');

                return {
                  id: vesting.id,
                  data: vestingInfo
                };
              }
              return vesting;
            });

            setVestings(newVestings);
          }
        }
      });
    });

    return () => {
      subscribe();
    };
  }, [vestings, organizationId]);

  useEffect(() => {
    if (vestings && vestings.length > 0) {
      vestings.forEach((vesting) => {
        if (vesting.data.status === 'LIVE') {
          setVestingsStatus((previousStatus) => ({
            ...previousStatus,
            [vesting.id]: 'LIVE'
          }));
        }
      });
    }
  }, [vestings]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => ({
  ...useContext(DashboardContext)
});
