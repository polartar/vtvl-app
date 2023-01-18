import { useWeb3React } from '@web3-react/core';
import { Timestamp, onSnapshot, query, where } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import { transactionCollection, vestingCollection } from 'services/db/firestore';
import { fetchVestingsByQuery, updateVesting } from 'services/db/vesting';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { ITransaction, IVesting } from 'types/models';
import { IRecipient } from 'types/vesting';
import { generateRandomName } from 'utils/shared';

import { useAuthContext } from './auth.context';

interface ITransactionData {
  id: string;
  data: ITransaction;
}

const PendingTransactionContextContext = createContext({} as ITransactionData[]);

export function PendingTransactionContextProvider({ children }: any) {
  const { account, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [pendingTransactions, setPendingTransactions] = useState<ITransactionData[]>([]);

  useEffect(() => {
    let transactions: ITransactionData[] = pendingTransactions;
    const q = query(transactionCollection, where('organizationId', '==', organizationId));
    const subscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.status === 'PENDING') {
            transactions.push({
              id: change.doc.id,
              data
            });
          }
        } else if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.status !== 'PENDING') {
            transactions = transactions.filter((transaction) => transaction.id !== change.doc.id);
          }
        }
      });
      setPendingTransactions(transactions);
    });

    return () => {
      subscribe();
    };
  }, [pendingTransactions]);

  return (
    <PendingTransactionContextContext.Provider value={pendingTransactions}>
      {children}
    </PendingTransactionContextContext.Provider>
  );
}

export const usePendingTransactionContext = () => ({
  ...useContext(PendingTransactionContextContext)
});
