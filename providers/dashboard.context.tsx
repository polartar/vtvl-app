import RecipientApiService from '@api-services/RecipientApiService';
import RevokingApiService from '@api-services/RevokingApiService';
import VestingContractApiService from '@api-services/VestingContractApiService';
import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import { useAuth } from '@store/useAuth';
import { useOrganization } from '@store/useOrganizations';
import { transformVestingSchedule } from '@utils/vesting';
import { useWeb3React } from '@web3-react/core';
import VTVL2_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import { onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { vestingCollection, vestingContractCollection } from 'services/db/firestore';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting } from 'types/models';
import { IRecipient, IRecipientForm } from 'types/models/recipient';
import { TCapTableRecipientTokenDetails } from 'types/models/token';
import { compareAddresses } from 'utils';
import { isV2 } from 'utils/multicall';
import { getRecipient } from 'utils/recipients';

import { useAuthContext } from './auth.context';
import { useLoaderContext } from './loader.context';
import { useTokenContext } from './token.context';

type IVestingStatus = 'FUNDING_REQUIRED' | 'PENDING' | 'EXECUTABLE' | 'LIVE';

interface IDashboardData {
  vestings: { id: string; data: IVesting }[];
  revokings: IRevoking[];
  recipients: IRecipient[];
  vestingContracts: IVestingContract[];
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
  safeTransactions: { [key: string]: SafeTransaction };
  // fetchDashboardVestingContract: () => void;
  updateVestingContract: (data: IVestingContract) => void;
  fetchDashboardVestings: () => void;
  setOwnershipTransfered: (v: boolean) => void;
  fetchDashboardData: () => void;
  setRemoveOwnership: (v: boolean) => void;
  setVestingsStatus: (v: { [key: string]: IVestingStatus }) => void;
  setSafeTransactions: (v: { [key: string]: SafeTransaction }) => void;
}

const DashboardContext = createContext({} as IDashboardData);

export function DashboardContextProvider({ children }: any) {
  const { account, chainId, library } = useWeb3React();
  const { accessToken } = useAuth();
  const { mintFormState } = useTokenContext();
  // const { organizationId, currentSafe } = useAuthContext();
  const { organizationId } = useOrganization();
  const { showLoading, hideLoading } = useLoaderContext();
  const router = useRouter();

  /* Vesting state */
  const [vestingsLoading, setVestingsLoading] = useState(false);
  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);

  /* Vesting Contract state */
  const [vestingContractLoading, setVestingContractLoading] = useState(false);
  const [vestingContracts, setVestingContracts] = useState<IVestingContract[]>([]);

  const [revokings, setRevokings] = useState<IRevoking[]>([]);
  const [ownershipTransfered, setOwnershipTransfered] = useState(false);
  const [removeOwnership, setRemoveOwnership] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [recipients, setRecipients] = useState<IRecipient[]>([]);
  const [vestingsStatus, setVestingsStatus] = useState<{ [key: string]: IVestingStatus }>({});
  const [safeTransactions, setSafeTransactions] = useState<{ [key: string]: SafeTransaction }>({});

  // Stores everything about the user token details
  // Used to compute total withdrawn, unclaimed, total allocations etc.
  const [totalAllocation, setTotalAllocation] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [totalWithdrawn, setTotalWithdrawn] = useState(ethers.BigNumber.from(0));
  const [totalClaimable, setTotalClaimable] = useState(ethers.BigNumber.from(0));
  const [claims, setClaims] = useState(0);
  const [recipientTokenDetails, setRecipientTokenDetails] = useState<TCapTableRecipientTokenDetails[]>([]);

  /* Fetch all vestings by organizationId and chainId */
  const fetchDashboardVestings = useCallback(async () => {
    if (!organizationId || !chainId || !accessToken) return;

    setVestingsLoading(true);

    try {
      const res = await VestingScheduleApiService.getVestingSchedules(organizationId);
      // Filter out without the archived records
      const filteredVestingSchedules = res
        .filter(
          (v) => !v.archive && v.status !== 'REVOKED' //&& v.chainId === chainId
        )
        .map((vestingSchedule) => ({ id: vestingSchedule.id!, data: transformVestingSchedule(vestingSchedule) }));
      setVestings(filteredVestingSchedules);
    } catch (err) {
      console.log('fetchDashboardVestings - ', err);
    }

    setVestingsLoading(false);
  }, [organizationId, chainId, accessToken]);

  /* Fetch all pending revokings by organizationId and chainId */
  const fetchDashboardRevokings = useCallback(async () => {
    if (chainId && organizationId) {
      try {
        const res = await RevokingApiService.getRevokings(organizationId, chainId);
        setRevokings(res.filter((revoking) => revoking.status === 'PENDING'));
      } catch (err) {
        console.log('fetchDashboardRevokings - ', err);
      }
    }
  }, [organizationId, chainId]);

  /* Fetch all recipients by organizationId and chainId */
  const fetchDashboardRecipients = useCallback(async () => {
    try {
      // const res = await fetchRecipientsByQuery(['organizationId', 'chainId'], ['==', '=='], [organizationId, chainId]);
      const res = await RecipientApiService.getRecipients(`organizationId=${organizationId}&chainId=${chainId}`);
      setRecipients(res);
    } catch (err) {
      console.error('Fetching recipients data error in DashboardContext: ', err);
    }
  }, [organizationId, chainId]);

  /* Fetch vestings & pending revoking & transactions & recipients data by organizationId and chainId */
  const fetchDashboardData = useCallback(async () => {
    if (organizationId && chainId) {
      showLoading();
      try {
        await Promise.all([fetchDashboardVestings(), fetchDashboardRevokings(), fetchDashboardRecipients()]);
      } catch (err) {
        console.log('fetchDashboardData - ', err);
        setVestings([]);
      }
      hideLoading();
    } else {
      setVestings([]);
      setRevokings([]);
    }
  }, [organizationId, chainId]);

  const updateVestingContract = (data: IVestingContract) => {
    if (vestingContracts.find((vestingContract) => vestingContract.id === data.id)) {
      const newVestingContracts = vestingContracts.map((vestingContract) => {
        if (vestingContract.id === data.id) {
          return { ...vestingContract, ...data };
        }
        return vestingContract;
      });
      setVestingContracts(newVestingContracts);
    } else {
      setVestingContracts([...vestingContracts, data]);
    }
  };

  /**
   * This function is intended to initialize the multicall function
   * Will compute all the total amounts for
   * - Withdrawn
   * - Claimable tokens
   * - Total allocation
   * This will also map out all the recipients that has allocations and all their token details
   */
  const initializeMulticall = useCallback(async () => {
    showLoading();

    // Start to check for all the required states before doing anything
    if (
      vestingContracts.length &&
      chainId &&
      mintFormState &&
      mintFormState.address &&
      vestings.length &&
      recipients.length
    ) {
      const recipientWallets = recipients
        .map((recipient) => recipient.address)
        .filter(
          (address, index) => !!address && recipients.findIndex((recipient) => recipient.address === address) === index
        );

      const multicall = new Multicall({
        ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
        tryAggregate: true
      });

      // Setup multicall
      const contractCallContext: ContractCallContext[] = vestingContracts.reduce((res, vestingContract) => {
        // Ensure that what we add in the call has vesting contract address
        if (vestingContract && vestingContract.address) {
          const vestingSchedule = vestings.find((schedule) => schedule.data.vestingContractId === vestingContract.id);
          if (vestingSchedule) {
            res = [
              ...res,
              ...recipientWallets.map((recipientWallet) => ({
                // Attach the contract address, recipient wallet and schedule ID
                reference: `multicall-${vestingContract.address}-${recipientWallet}-${vestingSchedule?.id}`,
                contractAddress: vestingContract.address ?? '',
                abi: isV2(new Date(vestingContract.updatedAt).getTime() / 1000)
                  ? VTVL2_VESTING_ABI.abi
                  : VTVL_VESTING_ABI.abi,
                calls: [
                  {
                    // This gets the claimable amount by the recipient
                    reference: 'claimableAmount',
                    methodName: 'claimableAmount',
                    methodParameters: [recipientWallet]
                  },
                  // {
                  //   // This gets the total vested amount for the recipient (includes everything)
                  //   reference: 'finalVestedAmount',
                  //   methodName: 'finalVestedAmount',
                  //   methodParameters: [recipient]
                  // },
                  // {
                  //   // This gets the current vested amount as of date (currently unlocked tokens, both claimed and unclaimed)
                  //   reference: 'vestedAmount',
                  //   methodName: 'vestedAmount',
                  //   methodParameters: [recipient, getUnixTime(new Date())]
                  // },
                  { reference: 'getClaim', methodName: 'getClaim', methodParameters: [recipientWallet] }
                ]
              }))
            ];
          }
        }
        return res;
      }, [] as ContractCallContext[]);

      // Initialize the recipients for the cap table
      const recipientsTokenDetails: TCapTableRecipientTokenDetails[] = [];

      try {
        // Call the multicall feature
        const multicallResponse = await multicall.call(contractCallContext);

        if (multicallResponse) {
          const res = multicallResponse;
          // Set constants for referencing the calls based on the multicall setup above
          const CLAIMABLE_AMOUNT_CALL = 0;
          const GET_CLAIM_CALL = 1;

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
            const claimedAmount = ethers.BigNumber.from(record[GET_CLAIM_CALL].returnValues[5]);
            const linearAmount = record[GET_CLAIM_CALL].returnValues[4];
            const cliffAmount = record[GET_CLAIM_CALL].returnValues[6];
            const totalAllocation = ethers.BigNumber.from(linearAmount).add(cliffAmount);

            // Computes the locked tokens of the recipient
            const lockedTokens = totalAllocation.sub(claimedAmount).sub(claimableAmount);

            totalClaimableAmount = totalClaimableAmount.add(claimableAmount);
            totalAllocationAmount = totalAllocationAmount.add(totalAllocation);
            totalWithdrawnAmount = totalWithdrawnAmount.add(claimedAmount);
            if (claimedAmount.gt(ethers.BigNumber.from(0))) claimedCount++;

            // Setting up the recipient details based on wallet address from the multicall result
            const wallet = key.split('-')[2]; // contains the wallet address from `multicall-[0xContractAddress]-[0xWalletAddress]`
            const scheduleId = key.split('-')[3]; // contains the schedule id from multicall reference
            // Get the recipient details
            const currentRecipient = recipients.find(({ address }) => compareAddresses(address, wallet));

            // Only add it in if the recipient on a particular vesting contract and schedule has vested allocation.
            if (currentRecipient && ethers.BigNumber.from(totalAllocation).gt(0)) {
              recipientsTokenDetails.push({
                scheduleId,
                name: currentRecipient.name,
                // company: currentRecipient.company ?? '',
                // Some data especially on the recipients collection saves the recipientType as string ie., 'employee', 'founder', etc.
                // while in the old one, it uses the select components values ie [{ label: 'Employee', value: 'employee' }] etc.
                recipientType: currentRecipient.role,
                address: currentRecipient.address,
                // Ensure that the totalAllocation for each recipient is divided by the number of recipients
                totalAllocation: totalAllocation,
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

    hideLoading();
  }, [vestingContracts, mintFormState, vestings, recipients, chainId, mintFormState]);

  useEffect(() => {
    initializeMulticall();
  }, [chainId, vestingContracts, mintFormState, vestings, recipients]);

  useEffect(() => {
    if (!organizationId || !chainId || !accessToken) return;

    VestingContractApiService.getOrganizationVestingContracts(organizationId).then((res) => setVestingContracts(res));
  }, [organizationId, chainId, accessToken]);

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

    if (!organizationId || !chainId) return;
    const q = query(vestingCollection, where('organizationId', '==', organizationId), where('chainId', '==', chainId));
    const subscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const vestingInfo = change.doc.data();
          const newVestings = vestings.map((vesting) => {
            if (vesting.id === change.doc.id) {
              if (vestingInfo.status === 'LIVE') {
                toast.success(`Added schedules successfully. ${vestingInfo.name}`);
              }
              return {
                id: vesting.id,
                data: vestingInfo
              };
            }
            return vesting;
          });
          setVestings(newVestings);
        }
      });
    });

    return () => {
      subscribe();
    };
  }, [vestings, organizationId, chainId]);

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

  /* Global states */
  const value = useMemo(
    () => ({
      vestings,
      revokings,
      recipients,
      vestingContracts,
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
      safeTransactions,
      updateVestingContract,
      fetchDashboardVestings,
      setOwnershipTransfered,
      fetchDashboardData,
      setRemoveOwnership,
      setVestingsStatus,
      setSafeTransactions
    }),
    [
      vestings,
      recipients,
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
      recipientTokenDetails,
      safeTransactions
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => ({
  ...useContext(DashboardContext)
});
