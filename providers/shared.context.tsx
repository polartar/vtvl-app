import React, { createContext, useContext, useMemo, useState } from 'react';

interface ISharedData {
  isPageLoading: boolean;
  setPageLoading: (value: boolean) => void;
}

const SharedContext = createContext({} as ISharedData);

export function SharedContextProvider({ children }: any) {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const value = useMemo(
    () => ({
      isPageLoading,
      setPageLoading: setIsPageLoading
    }),
    [isPageLoading, setIsPageLoading]
  );

  return <SharedContext.Provider value={value}>{children}</SharedContext.Provider>;
}

export const useSharedContext = () => ({
  ...useContext(SharedContext)
});
