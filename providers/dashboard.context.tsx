import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { fetchTransactionsByQuery } from 'services/db/transaction';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { fetchVestingContractByQuery, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction, IVesting, IVestingContract } from 'types/models';
import { IRecipient } from 'types/vesting';
import { parseTokenAmount } from 'utils/token';

import { useAuthContext } from './auth.context';
import { useLoaderContext } from './loader.context';
import { useSharedContext } from './shared.context';
import { useTokenContext } from './token.context';

interface IDashboardData {
  vestings: { id: string; data: IVesting }[];
  vestingContract: { id: string; data: IVestingContract | undefined } | undefined;
  transactions: { id: string; data: ITransaction }[];
  ownershipTransfered: boolean;
  insufficientBalance: boolean;
  depositAmount: string;
  vestingsLoading: boolean;
  vestingContractLoading: boolean;
  transactionsLoading: boolean;
  removeOwnership: boolean;
  fetchDashboardVestingContract: () => void;
  fetchDashboardVestings: () => void;
  fetchDashboardTransactions: () => void;
  setOwnershipTransfered: (v: boolean) => void;
  fetchDashboardData: () => void;
  fetchVestingContractBalance: () => void;
  setRemoveOwnership: (v: boolean) => void;
}

const DashboardContext = createContext({} as IDashboardData);

export function DashboardContextProvider({ children }: any) {
  const { account, chainId } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { organizationId, safe } = useAuthContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const router = useRouter();

  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);
  const [vestingContract, setVestingContract] = useState<
    { id: string; data: IVestingContract | undefined } | undefined
  >();
  const [transactions, setTransactions] = useState<{ id: string; data: ITransaction }[]>([]);
  const [ownershipTransfered, setOwnershipTransfered] = useState(false);
  const [removeOwnership, setRemoveOwnership] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [vestingsLoading, setVestingsLoading] = useState(false);
  const [vestingContractLoading, setVestingContractLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const fetchDashboardVestingContract = async () => {
    try {
      setVestingContractLoading(true);
      const res = await fetchVestingContractsByQuery('organizationId', '==', organizationId!);
      if (res && res.length > 0) {
        const contract = res.find((v) => {
          if (v && v.data.chainId) {
            return v.data.chainId === chainId;
          }
          return false;
        });
        setVestingContract(contract);
      } else {
        setVestingContract(undefined);
      }
    } catch (err) {
      console.log('fetchDashboardVestingContract - ', err);
      setVestingContract(undefined);
    }
    setVestingContractLoading(false);
  };

  const fetchDashboardVestings = async () => {
    setVestingsLoading(true);
    try {
      const res = await fetchVestingsByQuery('organizationId', '==', organizationId!);
      // Filter out without the archived records
      const filteredVestingSchedules = res.filter((v) => !v.data.archive && v.data.chainId === chainId);
      setVestings(filteredVestingSchedules);
    } catch (err) {
      console.log('fetchDashboardVestings - ', err);
    }
    setVestingsLoading(false);
  };

  const fetchDashboardTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const res = await fetchTransactionsByQuery('organizationId', '==', organizationId!);
      setTransactions(res.filter((v) => v.data.chainId === chainId));
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
        await fetchDashboardVestingContract();
        await fetchDashboardTransactions();
      } catch (err) {
        console.log('fetchDashboardData - ', err);
        setVestings([]);
        setVestingContract(undefined);
        setTransactions([]);
      }
      hideLoading();
    } else {
      setVestings([]);
      setVestingContract(undefined);
      setTransactions([]);
    }
  };

  const fetchVestingContractBalance = async () => {
    if (vestings && vestings.length > 0 && vestingContract && vestingContract.id && mintFormState.address && chainId) {
      let totalVestingAmount = 0;
      vestings
        .filter((vesting) => vesting.data.status !== 'SUCCESS')
        .forEach(
          (vesting) => (totalVestingAmount += parseFloat(vesting.data.details.amountToBeVested as unknown as string))
        );
      const tokenContract = new ethers.Contract(
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
      // const vestingContract = new ethers.Contract(vesting.vestingContract, VTVL_VESTING_ABI.abi, library.getSigner());
      tokenContract.balanceOf(vestingContract.data?.address).then((res: string) => {
        if (BigNumber.from(res).lt(BigNumber.from(parseTokenAmount(totalVestingAmount)))) {
          setInsufficientBalance(true);
          setDepositAmount(
            BigNumber.from(parseTokenAmount(totalVestingAmount))
              .sub(BigNumber.from(res))
              .div(BigNumber.from((10 ** 18).toString()))
              .toString()
          );
          return;
        } else {
          setDepositAmount('');
          setInsufficientBalance(false);
          return;
        }
      });
    }
    setInsufficientBalance(false);
    setDepositAmount('');
  };

  const value = useMemo(
    () => ({
      vestings,
      vestingContract,
      transactions,
      ownershipTransfered,
      insufficientBalance,
      depositAmount,
      vestingsLoading,
      vestingContractLoading,
      transactionsLoading,
      removeOwnership,
      fetchDashboardVestingContract,
      fetchDashboardVestings,
      fetchDashboardTransactions,
      setOwnershipTransfered,
      fetchDashboardData,
      fetchVestingContractBalance,
      setRemoveOwnership
    }),
    [
      vestings,
      vestingContract,
      transactions,
      ownershipTransfered,
      insufficientBalance,
      depositAmount,
      vestingsLoading,
      vestingContractLoading,
      transactionsLoading,
      removeOwnership
    ]
  );

  useEffect(() => {
    if (organizationId || (router && router.pathname === '/dashboard')) fetchDashboardData();
  }, [organizationId, router, chainId]);

  useEffect(() => {
    fetchVestingContractBalance();
  }, [vestingContract, vestings, mintFormState, chainId]);

  useEffect(() => {
    if (vestingContract?.data && safe?.address && chainId) {
      const VestingContract = new ethers.Contract(
        vestingContract.data.address,
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      VestingContract.isAdmin(safe.address).then((res: any) => {
        setOwnershipTransfered(res);
      });
    } else if (vestingContract?.data && vestingContract.data.status === 'SUCCESS' && !safe?.address) {
      setOwnershipTransfered(true);
    }
  }, [organizationId, vestingContract, safe, chainId]);

  useEffect(() => {
    if (
      vestingContract?.data &&
      safe?.address &&
      safe.owners[0] &&
      chainId &&
      ownershipTransfered &&
      account &&
      account.toLowerCase() === safe.owners[0].address.toLowerCase()
    ) {
      const VestingContract = new ethers.Contract(
        vestingContract.data.address,
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );
      VestingContract.isAdmin(account)
        .then((res: any) => {
          setRemoveOwnership(res);
        })
        .catch((err: any) => {
          console.log('removeOwnership - ', err);
          setRemoveOwnership(false);
        });
    }
  }, [ownershipTransfered, organizationId, vestingContract, safe, account, chainId]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => ({
  ...useContext(DashboardContext)
});
