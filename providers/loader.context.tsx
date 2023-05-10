import useToggle from 'hooks/useToggle';
import React, { createContext, useContext, useEffect } from 'react';

interface ILoaderData {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoaderContext = createContext({} as ILoaderData);

export function LoaderContextProvider({ children }: any) {
  const [loading, , , setLoading, setUnloading] = useToggle(false);
  let timeout: NodeJS.Timeout;

  // Works like a debounce by adding a delay before we hide the loading page.
  // This will prevent our app from displaying flashes of contents while states / hooks are updating.
  const handleHideLoading = () => {
    timeout = setTimeout(setUnloading, 600);
  };

  // Clear the timer when unmounted
  useEffect(() => {
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        loading,
        showLoading: setLoading,
        hideLoading: handleHideLoading
      }}>
      {children}
    </LoaderContext.Provider>
  );
}

export const useLoaderContext = () => ({
  ...useContext(LoaderContext)
});
