import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import { onSnapshot } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { transactionCollection } from 'services/db/firestore';

interface ITransactionLoadeerData {
  transactionStatus: TransactionStatuses;
  setTransactionStatus: (v: TransactionStatuses) => void;
}

const TransactionLoader = createContext({} as ITransactionLoadeerData);

export function TransactionLoaderContextProvider({ children }: any) {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatuses>('');

  console.log('Tx Loader Context', transactionStatus);
  const { safe, organizationId } = useAuthContext();
  const value = useMemo(
    () => ({
      transactionStatus,
      setTransactionStatus
    }),
    [transactionStatus, setTransactionStatus]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(transactionCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const transactionInfo = change.doc.data();
          if (transactionInfo.organizationId === organizationId) {
            if (transactionInfo.status === 'SUCCESS') {
              setTransactionStatus('SUCCESS');
            }
            if (transactionInfo.status === 'FAILED') {
              setTransactionStatus('ERROR');
            }
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
