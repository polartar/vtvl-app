import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import React, { createContext, useContext, useMemo, useState } from 'react';

interface ITransactionLoadeerData {
  transactionStatus: TransactionStatuses;
  setTransactionStatus: (v: TransactionStatuses) => void;
}

const TransactionLoader = createContext({} as ITransactionLoadeerData);

export function TransactionLoaderContextProvider({ children }: any) {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatuses>('');

  console.log('Tx Loader Context', transactionStatus);

  const value = useMemo(
    () => ({
      transactionStatus,
      setTransactionStatus
    }),
    [transactionStatus, setTransactionStatus]
  );

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
