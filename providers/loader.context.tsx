import useToggle from 'hooks/useToggle';
import React, { createContext, useContext } from 'react';

interface ILoaderData {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoaderContext = createContext({} as ILoaderData);

export function LoaderContextProvider({ children }: any) {
  const [loading, , , setLoading, setUnloading] = useToggle(false);

  return (
    <LoaderContext.Provider
      value={{
        loading,
        showLoading: setLoading,
        hideLoading: setUnloading
      }}>
      {children}
    </LoaderContext.Provider>
  );
}

export const useLoaderContext = () => ({
  ...useContext(LoaderContext)
});
