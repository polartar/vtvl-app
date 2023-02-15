import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import { vestingCollection, vestingContractCollection } from 'services/db/firestore';
import { fetchRevokingsByQuery } from 'services/db/revoking';
import { fetchTransactionsByQuery } from 'services/db/transaction';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { fetchVestingContractByQuery, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRevoking, ITransaction, IVesting, IVestingContract } from 'types/models';
import { IVestingStatus } from 'types/models/vesting';
import { IRecipient } from 'types/vesting';
import { parseTokenAmount } from 'utils/token';

import { useAuthContext } from './auth.context';
import { useLoaderContext } from './loader.context';
import { useSharedContext } from './shared.context';
import { useTokenContext } from './token.context';

type IVestingStatus = 'FUNDING_REQUIRED' | 'PENDING' | 'EXECUTABLE' | 'LIVE';

interface IDashboardData {
  vestings: { id: string; data: IVesting }[];
  revokings: { id: string; data: IRevoking }[];
  recipients: MultiValue<IRecipient>;
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
  const [recipients, setRecipients] = useState<MultiValue<IRecipient>>([]);
  const [vestingsStatus, setVestingsStatus] = useState<{ [key: string]: IVestingStatus }>({});

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
      vestingsStatus
    ]
  );

  useEffect(() => {
    if (chainId && (organizationId || (router && router.pathname === '/dashboard'))) fetchDashboardData();
  }, [organizationId, router, chainId]);

  useEffect(() => {
    if (!vestings) {
      return;
    }

    let allRecipients: MultiValue<IRecipient> = [];
    vestings.forEach((vesting) => {
      allRecipients = [...allRecipients, ...vesting.data.recipients];
    });
    setRecipients(
      allRecipients.filter(
        (recipient, i) =>
          i === allRecipients.findIndex((r) => r.walletAddress.toLowerCase() === recipient.walletAddress.toLowerCase())
      )
    );
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
