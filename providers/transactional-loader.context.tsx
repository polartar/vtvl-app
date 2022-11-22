import TransactionModal, { TransactionStatuses } from '@components/molecules/TransactionModal/TransactionModal';
import React, { createContext, useContext, useMemo, useState } from 'react';

interface ITransactionalLoaderData {
  status: TransactionStatuses;
  setStatus: (v: any) => void;
}

const TransactionalLoaderContext = createContext({} as ITransactionalLoaderData);

export function TransactionalLoaderContextProvider({ children }: any) {
  const [status, setStatus] = useState<TransactionStatuses>('');

  console.log('Tx Loader Context', status);

  const value = useMemo(
    () => ({
      status,
      setStatus
    }),
    [status, setStatus]
  );

  return (
    <TransactionalLoaderContext.Provider value={value}>
      {children}
      <TransactionModal status={status} />
    </TransactionalLoaderContext.Provider>
  );
}

export const useTransactionalLoaderContext = () => ({
  ...useContext(TransactionalLoaderContext)
});

// Usage: Just use the useTransactionalLoaderContext that has { status, setStatus } properties anywhere in the app.
// Values for the statuses are IN_PROGRESS, PENDING, SUCCESS and '' (blank), blank value will close the modal.
