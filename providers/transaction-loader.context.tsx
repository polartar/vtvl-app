import TransactionApiService from '@api-services/TransactionApiService';
import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import { useWeb3React } from '@web3-react/core';
import { onSnapshot, query, where } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ITransactionLoadeerData {
  transactionStatus: TransactionStatuses;
  setTransactionStatus: (v: TransactionStatuses) => void;
  updateTransactions: (data: ITransaction) => void;
  transactions: ITransaction[];
  pendingTransactions: ITransaction[];
  setIsCloseAvailable: (v: boolean) => void;
}

const TransactionLoader = createContext({} as ITransactionLoadeerData);

export function TransactionLoaderContextProvider({ children }: any) {
  const { chainId } = useWeb3React();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatuses>('');
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<ITransaction[]>([]);
  const [isCloseAvailable, setIsCloseAvailable] = useState<boolean>(true);
  const { currentSafe, organizationId } = useAuthContext();

  const updateTransactions = (data: ITransaction) => {
    if (transactions.find((t) => t.id === data.id)) {
      const newTransactions = transactions.map((t) => {
        if (t.id === data.id) {
          return { ...t, ...data };
        }
        return t;
      });
      setTransactions(newTransactions);
      setPendingTransactions(newTransactions.filter((t) => t.status === 'PENDING'));
    } else {
      setTransactions([...transactions, data]);
      if (data.status === 'PENDING') {
        setPendingTransactions([...pendingTransactions, data]);
      }
    }
  };

  const value = useMemo(
    () => ({
      transactionStatus,
      setTransactionStatus,
      transactions,
      pendingTransactions,
      setIsCloseAvailable,
      updateTransactions
    }),
    [transactionStatus, pendingTransactions, setTransactionStatus, transactions]
  );

  useEffect(() => {
    if (!organizationId || !chainId) return;

    TransactionApiService.getTransactions(organizationId, chainId).then((res) => {
      setTransactions(res);
      setPendingTransactions(res.filter((t) => t.status === 'PENDING'));
    });
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
