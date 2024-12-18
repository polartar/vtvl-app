import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import { useWeb3React } from '@web3-react/core';
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
  transactions: ITransactionData[];
  pendingTransactions: ITransactionData[];
  setIsCloseAvailable: (v: boolean) => void;
}

const TransactionLoader = createContext({} as ITransactionLoadeerData);

export function TransactionLoaderContextProvider({ children }: any) {
  const { chainId } = useWeb3React();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatuses>('');
  const [transactions, setTransactions] = useState<ITransactionData[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<ITransactionData[]>([]);
  const [isCloseAvailable, setIsCloseAvailable] = useState<boolean>(true);
  const { currentSafe, organizationId } = useAuthContext();
  const value = useMemo(
    () => ({
      transactionStatus,
      setTransactionStatus,
      transactions,
      pendingTransactions,
      setIsCloseAvailable
    }),
    [transactionStatus, pendingTransactions, setTransactionStatus, transactions]
  );

  useEffect(() => {
    let allTransactions: ITransactionData[] = [];
    let tmpPendingTransactions: ITransactionData[] = [];
    if (!organizationId || !chainId) return;

    const q = query(
      transactionCollection,
      where('organizationId', '==', organizationId),
      where('chainId', '==', chainId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          allTransactions.push({
            id: change.doc.id,
            data
          });
          tmpPendingTransactions.push({
            id: change.doc.id,
            data
          });
        } else if (change.type === 'modified') {
          const data = change.doc.data();
          allTransactions = allTransactions.map((transaction) => {
            if (transaction.id === change.doc.id) {
              return {
                id: transaction.id,
                data
              };
            }
            return transaction;
          });

          setTransactions(allTransactions.slice());
          if (data.status !== 'PENDING') {
            tmpPendingTransactions = tmpPendingTransactions.filter((transaction) => transaction.id !== change.doc.id);
            setPendingTransactions(tmpPendingTransactions.slice());
            if (data.status === 'SUCCESS') {
              setTransactionStatus('SUCCESS');
            }
            if (data.status === 'FAILED') {
              setTransactionStatus('ERROR');
            }
          }
        }
      });

      setTransactions([...allTransactions]);
      setPendingTransactions([...tmpPendingTransactions]);
    });

    return () => {
      unsubscribe();
    };
  }, [organizationId, chainId]);

  return (
    <TransactionLoader.Provider value={value}>
      {children}
      <TransactionModal status={transactionStatus} isCloseAvailable={isCloseAvailable} />
    </TransactionLoader.Provider>
  );
}

export const useTransactionLoaderContext = () => ({
  ...useContext(TransactionLoader)
});

// Usage: Just use the useTransactionLoader that has { status, setStatus } properties anywhere in the app.
// Values for the statuses are IN_PROGRESS, PENDING, SUCCESS and '' (blank), blank value will close the modal.
