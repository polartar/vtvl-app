import PageLoader from '@components/atoms/PageLoader/PageLoader';
import { useShallowState } from 'hooks/useShallowState';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { fetchWebsiteByDomain } from 'services/db/website';
import { IWebsite } from 'types/models';
import { IS_ENABLED_AUTH_BY_ORG } from 'utils/constants';

export interface IGlobalContextState {
  isLoading: boolean;
  website: IWebsite;
}

const initialState: IGlobalContextState = {
  isLoading: true,
  website: {
    name: '',
    domain: '',
    organizationId: '',
    styles: {}
  }
};

const GlobalContext = createContext({} as IGlobalContextState);

export function GlobalContextProvider({ children }: any) {
  const [state, setState] = useShallowState<IGlobalContextState>(initialState);

  /**
   * initialization() function is used to initially pick up if the current hostname has an existing record in our firebase database.
   * Styles are then assigned if a match has been found.
   */
  const initialization = useCallback(() => {
    console.log('INITIALIZE GLOBAL CONTEXT');
    // Only check for hostname and firebase matching when the website is hosted differently.
    if (IS_ENABLED_AUTH_BY_ORG) {
      const hostname = window.location.hostname;
      fetchWebsiteByDomain(hostname)
        .then((website) => {
          setState({ website });
        })
        .catch((error) => {
          console.error('Fetching website by domain is error: ', error);
        })
        .finally(() => {
          setState({ isLoading: false });
        });
    } else {
      setState({ isLoading: false });
    }
  }, []);

  // This function is intended to apply styling to the specified element.
  // Purpose is to update the color scheme of the whole app.
  const applyTheme = (theme: any, rootElement: any) => {
    if (theme && rootElement) {
      // Loops through all of the key in the theme object
      // Assuming:
      // --primary-900 is a key -- being used by our tailwind configuration
      // #123456 is a value
      // This will therefore override --primary-900 and apply the style to all affected elements.
      for (const key in theme) {
        console.log('Updating', key, theme[key as keyof typeof theme]);
        rootElement.style.setProperty(key, theme[key as keyof typeof theme]);
      }
    }
  };

  // When the root element is present, as well as the theme, update the colors
  // we are doing this because nextjs does not detect the `document` object on ssr
  useEffect(() => {
    if (state.website && state.website.styles) {
      const { theme } = state.website.styles;
      const elem = document.querySelector(':root');
      if (elem && theme) {
        applyTheme(theme, elem);
      }
    }
  }, [state]);

  // Initialize global context
  useEffect(() => {
    initialization();
  }, []);

  return (
    <GlobalContext.Provider value={state}>
      {state.isLoading ? <PageLoader loader="global" /> : children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => ({
  ...useContext(GlobalContext)
});
