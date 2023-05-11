import PageLoader from '@components/atoms/PageLoader/PageLoader';
import { useShallowState } from 'hooks/useShallowState';
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect } from 'react';
import { fetchWebsiteByDomain } from 'services/db/website';
import { IWebsite } from 'types/models';
import { WEBSITE_NAME } from 'utils/constants';

export interface IEmailTemplate {
  websiteName: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoImage: string;
  };
  links: {
    twitter: string;
    linkedIn: string;
    terms: string;
    privacy: string;
  };
}

export interface GlobalContextState {
  isLoading: boolean;
  website: IWebsite;
  emailTemplate: IEmailTemplate;
}

const defaultEmailTemplate: IEmailTemplate = {
  websiteName: 'VTVL',
  theme: {
    primaryColor: '#1b369a',
    secondaryColor: '#f9623b',
    logoImage:
      'https://firebasestorage.googleapis.com/v0/b/vtvl-v2-dev.appspot.com/o/email-template-assets%2Fvtvl-email-template-logo.png?alt=media&token=2b5bac6e-d595-4a85-b926-6d928e2e8764'
  },
  links: {
    twitter: 'https://twitter.com/vtvlco',
    linkedIn: 'https://www.linkedin.com/company/vtvl/',
    terms: 'https://www.vtvl.io/terms',
    privacy: 'https://www.vtvl.io/privacypolicy'
  }
};

const initialState: GlobalContextState = {
  isLoading: true,
  website: {
    name: '',
    domain: '',
    organizationId: ''
  },
  emailTemplate: defaultEmailTemplate
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
        // console.log('Updating', key, theme[key as keyof typeof theme]);
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

      // Update the emailTemplate
      // Updates the colors in order of priority first by using the bgColorPrimary in the emailTheme object,
      // then uses the app's theme, and lastly the default vtvl theme colors.
      setState({
        emailTemplate: {
          websiteName: state.website.name || WEBSITE_NAME,
          theme: {
            primaryColor:
              state.website.styles?.emailTheme?.bgColorPrimary ||
              theme['--primary-900'] ||
              state.emailTemplate.theme.primaryColor,
            secondaryColor:
              state.website.styles?.emailTheme?.bgColorSecondary ||
              theme['--secondary-900'] ||
              state.emailTemplate.theme.secondaryColor,
            logoImage: state?.website?.assets?.emailLogoImage || state.emailTemplate.theme.logoImage
          },
          links: {
            twitter: state?.website?.links?.twitter || state.emailTemplate.links.twitter,
            linkedIn: state?.website?.links?.linkedIn || state.emailTemplate.links.linkedIn,
            terms: state?.website?.links?.terms || state.emailTemplate.links.terms,
            privacy: state?.website?.links?.privacy || state.emailTemplate.links.privacy
          }
        }
      });
    }
  }, [state.website]);

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
