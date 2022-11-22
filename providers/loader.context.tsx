import PageLoader from 'components/atoms/PageLoader/PageLoader';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface ILoaderData {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoaderContext = createContext({} as ILoaderData);

export function LoaderContextProvider({ children }: any) {
  const [loading, setLoading] = useState(false);

  const showLoading = () => {
    if (!loading) setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      loading,
      showLoading,
      hideLoading
    }),
    [loading]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export const useLoaderContext = () => ({
  ...useContext(LoaderContext)
});
