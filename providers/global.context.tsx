import PageLoader from '@components/atoms/PageLoader/PageLoader';
import { useShallowState } from 'hooks/useShallowState';
import Lottie from 'lottie-react';
import VTVLLoaderData from 'public/VTVL_Loader.json';
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect } from 'react';
import { fetchWebsiteByDomain } from 'services/db/website';
import { IWebsite } from 'types/models';
import { IS_ENABLED_AUTH_BY_ORG } from 'utils/constants';

export interface GlobalContextState {
  isLoading: boolean;
  website: IWebsite;
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
  const initialization = useCallback(async () => {
    // Only check for hostname and firebase matching when the website is hosted differently.
    if (IS_ENABLED_AUTH_BY_ORG) {
      const hostname = window.location.hostname;
      // Handle error using try catch to gracefully display the default VTVL UI
      // if there is no match found in the website collection.
      // This avoids the client-side error in nextjs
      try {
        const website = await fetchWebsiteByDomain(hostname);
        if (website) {
          await setState({ website });
          setState({ isLoading: false });
        } else throw website;
      } catch (error) {
        setState({ isLoading: false });
        console.error('Fetching website by domain error: ', error);
      }
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
  }, [initialization]);

  // TODO improve loading state
  return (
    <GlobalContext.Provider value={state}>
      {state.isLoading ? <PageLoader loader="global" /> : children}
    </GlobalContext.Provider>
  );
};
