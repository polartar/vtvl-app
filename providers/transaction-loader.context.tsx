import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import { onSnapshot, query, where } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { transactionCollection } from 'services/db/firestore';
import { ITransaction } from 'types/models';

interface ITransactionData {
  id: string;
  data: ITransaction;
}
interface ITransactionLoadeerData {
  transactionStatus: TransactionStatuses;
  setTransactionStatus: (v: TransactionStatuses) => void;
  pendingTransactions: ITransactionData[];
}

const TransactionLoader = createContext({} as ITransactionLoadeerData);

export function TransactionLoaderContextProvider({ children }: any) {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatuses>('');
  const [pendingTransactions, setPendingTransactions] = useState<ITransactionData[]>([]);
  const { safe, organizationId } = useAuthContext();
  const value = useMemo(
    () => ({
      transactionStatus,
      setTransactionStatus,
      pendingTransactions
    }),
    [transactionStatus, pendingTransactions, setTransactionStatus]
  );

  useEffect(() => {
    let transactions: ITransactionData[] = [];
    if (!organizationId) return;

    const q = query(transactionCollection, where('organizationId', '==', organizationId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
            if (data.status === 'SUCCESS') {
              setTransactionStatus('SUCCESS');
            }
            if (data.status === 'FAILED') {
              setTransactionStatus('ERROR');
            }
          }
        }
      });

      setPendingTransactions(transactions.slice());
    });

    return () => {
      unsubscribe();
    };
  }, [organizationId]);

  return (
    <TransactionLoader.Provider value={value}>
      {children}
      <TransactionModal status={transactionStatus} />
    </TransactionLoader.Provider>
  );
}

export const useTransactionLoaderContext = () => ({
  ...useContext(TransactionLoader)
});

// Usage: Just use the useTransactionLoader that has { status, setStatus } properties anywhere in the app.
// Values for the statuses are IN_PROGRESS, PENDING, SUCCESS and '' (blank), blank value will close the modal.
