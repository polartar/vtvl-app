import { useShallowState } from 'hooks/useShallowState';
import Lottie from 'lottie-react';
import VTVLLoaderData from 'public/VTVL_Loader.json';
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect } from 'react';
import { fetchWebsiteByDomain } from 'services/db/website';
import { IWebsiteStyles } from 'types/models';
import { IS_ENABLED_AUTH_BY_ORG } from 'utils/constants';

export interface GlobalContextState {
  isLoading: boolean;
  website: IWebsiteData;
}

export interface IWebsiteData {
  domain?: string;
  name?: string;
  organizationId: string;
  styles: IWebsiteStyles;
}

const initialState: GlobalContextState = {
  isLoading: true,
  website: {
    name: '',
    domain: '',
    organizationId: '',
    styles: {}
  }
};

export const GlobalContext = createContext<GlobalContextState>(initialState);

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useShallowState<GlobalContextState>(initialState);

  /**
   * initialization() function is used to initially pick up if the current hostname has an existing record in our firebase database.
   * Styles are then assigned if a match has been found.
   */
  const initialization = useCallback(() => {
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
    const { theme } = state.website.styles;
    const elem = document.querySelector(':root');
    if (elem && theme) {
      applyTheme(theme, elem);
    }
  }, [state]);

  // Initialize global context
  useEffect(() => {
    initialization();
  }, [initialization]);

  // TODO improve loading state
  return state.isLoading ? <></> : <GlobalContext.Provider value={state}>{children}</GlobalContext.Provider>;
};
