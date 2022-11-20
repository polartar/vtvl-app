// Todo Arvin:
// Make a loader context here that can accept multiple instances of loading states -- from multiple API calls for example.
// Checks those multiple loading states before removing the page loading state.
import React, { createContext, useContext, useMemo, useState } from 'react';

interface ISharedData {
  isPageLoading: boolean;
  updatePageLoading: (value: boolean) => void;
}

const SharedContext = createContext({} as ISharedData);

export function SharedContextProvider({ children }: any) {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const value = useMemo(
    () => ({
      isPageLoading,
      updatePageLoading: setIsPageLoading
    }),
    [isPageLoading]
  );

  return <SharedContext.Provider value={value}>{children}</SharedContext.Provider>;
}

export const useSharedContext = () => ({
  ...useContext(SharedContext)
});
