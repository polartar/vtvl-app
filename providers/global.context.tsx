import { useShallowState } from 'hooks/useShallowState';
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect } from 'react';
import { fetchWebsiteByDomain } from 'services/db/website';
import { IWebsiteStyles } from 'types/models';

export interface GlobalContextState {
  isLoading: boolean;
  organizationId: string;
  styles: IWebsiteStyles;
}

const initialState: GlobalContextState = {
  isLoading: true,
  organizationId: '',
  styles: {}
};

export const GlobalContext = createContext<GlobalContextState>(initialState);

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useShallowState<GlobalContextState>(initialState);

  const initialization = useCallback(() => {
    const hostname = window.location.hostname;
    console.log('DEBUG-hostname', hostname);
    fetchWebsiteByDomain(hostname)
      .then((website) => {
        setState({
          organizationId: website?.organizationId,
          styles: website?.styles ?? {}
        });
      })
      .catch((error) => {
        console.error('Fetching website by domain is error: ', error);
      })
      .finally(() => {
        setState({ isLoading: false });
      });
  }, []);

  useEffect(() => {
    initialization();
  }, [initialization]);

  // TODO improve loading state
  return state.isLoading ? <></> : <GlobalContext.Provider value={state}>{children}</GlobalContext.Provider>;
};
