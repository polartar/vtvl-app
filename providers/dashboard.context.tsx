import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { fetchTransactionsByQuery } from 'services/db/transaction';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { ITransaction, IVesting, IVestingContract } from 'types/models';
import { IRecipient } from 'types/vesting';
import { parseTokenAmount } from 'utils/token';

import { useAuthContext } from './auth.context';
import { useTokenContext } from './token.context';

interface IDashboardData {
  vestings: { id: string; data: IVesting }[];
  vestingContract: { id: string; data: IVestingContract | undefined } | undefined;
  transactions: { id: string; data: ITransaction }[];
  ownershipTransfered: boolean;
  insufficientBalance: boolean;
  depositAmount: string;
  fetchDashboardVestingContract: () => void;
  fetchDashboardVestings: () => void;
  fetchDashboardTransactions: () => void;
  setOwnershipTransfered: (v: boolean) => void;
}

const DashboardContext = createContext({} as IDashboardData);

export function DashboardContextProvider({ children }: any) {
  const { account } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { organizationId, safe } = useAuthContext();

  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);
  const [vestingContract, setVestingContract] = useState<
    { id: string; data: IVestingContract | undefined } | undefined
  >();
  const [transactions, setTransactions] = useState<{ id: string; data: ITransaction }[]>([]);
  const [ownershipTransfered, setOwnershipTransfered] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  console.log({ depositAmount });
  const fetchDashboardVestingContract = () => {
    if (organizationId)
      fetchVestingContractByQuery('organizationId', '==', organizationId).then((res) => {
        setVestingContract(res);
      });
  };

  const fetchDashboardVestings = () => {
    if (organizationId) fetchVestingsByQuery('organizationId', '==', organizationId).then((res) => setVestings(res));
  };

  const fetchDashboardTransactions = () => {
    if (organizationId)
      fetchTransactionsByQuery('organizationId', '==', organizationId).then((res) => setTransactions(res));
  };

  const value = useMemo(
    () => ({
      vestings,
      vestingContract,
      transactions,
      ownershipTransfered,
      insufficientBalance,
      depositAmount,
      fetchDashboardVestingContract,
      fetchDashboardVestings,
      fetchDashboardTransactions,
      setOwnershipTransfered
    }),
    [vestings, vestingContract, transactions, ownershipTransfered, insufficientBalance, depositAmount]
  );

  useEffect(() => {
    if (organizationId) {
      fetchDashboardVestings();
      fetchDashboardVestingContract();
      fetchDashboardTransactions();
    }
  }, [organizationId]);

  useEffect(() => {
    if (vestings && vestings.length > 0 && vestingContract && vestingContract.id && mintFormState.address) {
      let totalVestingAmount = 0;
      vestings
        .filter((vesting) => vesting.data.status !== 'SUCCESS')
        .forEach(
          (vesting) => (totalVestingAmount += parseInt(vesting.data.details.amountToBeVested as unknown as string))
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
        ethers.getDefaultProvider(
          `https://${process.env.NEXT_PUBLIC_TEST_NETWORK_NAME}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
        )
      );
      // const vestingContract = new ethers.Contract(vesting.vestingContract, VTVL_VESTING_ABI.abi, library.getSigner());
      tokenContract.balanceOf(vestingContract.data?.address).then((res: string) => {
        console.log({ res });
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
  }, [vestingContract, vestings, mintFormState]);

  useEffect(() => {
    if (vestingContract?.data && safe?.address) {
      const VestingContract = new ethers.Contract(
        vestingContract.data.address,
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(
          `https://${process.env.NEXT_PUBLIC_TEST_NETWORK_NAME}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
        )
      );
      VestingContract.isAdmin(safe.address).then((res: any) => {
        setOwnershipTransfered(res);
      });
    }
  }, [organizationId, vestingContract, safe, ownershipTransfered]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => ({
  ...useContext(DashboardContext)
});
