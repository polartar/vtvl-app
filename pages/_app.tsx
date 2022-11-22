import DefaultLayout from '@components/organisms/Layout/DefaultLayout';
import { Web3Provider } from '@ethersproject/providers';
import { AuthContextProvider } from '@providers/auth.context';
import { DashboardContextProvider } from '@providers/dashboard.context';
import { OnboardingContextProvider } from '@providers/onboarding.context';
import { TokenContextProvider } from '@providers/token.context';
import { TransactionalLoaderContextProvider } from '@providers/transactional-loader.context';
import { VestingContextProvider } from '@providers/vesting.context';
import { Web3ReactProvider } from '@web3-react/core';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import React, { ReactElement, ReactNode } from 'react';
// Todo: Arvin #18 - Explore styles that can be customized / override to conform with VTVL branding.
// React datepicker initial styling.
import 'react-datepicker/dist/react-datepicker.css';
// Skeleton loader styles
import 'react-loading-skeleton/dist/skeleton.css';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';
// Toast initial styling.
import 'react-toastify/dist/ReactToastify.css';
import ReactTooltip from 'react-tooltip';
import 'styles/globals.css';

// Exporting a layout type for nested layouts
export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any');
  library.pollingInterval = 15000;
  return library;
}

// const Web3ReactProviderReloaded = createWeb3ReactRoot('network')

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  Modal.setAppElement('#react-modal');
  // Use the layout defined at the page level, if available
  // Make way for the contextAPI to update the sidebar and connected states of the user in the default layout.
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Web3ReactProvider getLibrary={(provider: any) => getLibrary(provider)}>
        {/* <Web3ReactProviderReloaded getLibrary={getLibrary}> */}
        <AuthContextProvider>
          <TokenContextProvider>
            <OnboardingContextProvider>
              <VestingContextProvider>
                <DashboardContextProvider>
                  <TransactionalLoaderContextProvider>
                    {/* <DefaultLayout sidebar={true} connected={true}> */}
                    <DefaultLayout>{getLayout(<Component {...pageProps} />)}</DefaultLayout>
                    <ToastContainer />
                    <ReactTooltip
                      effect="solid"
                      type="dark"
                      place="top"
                      multiline
                      delayShow={300}
                      backgroundColor="var(--neutral-700)"
                    />
                  </TransactionalLoaderContextProvider>
                </DashboardContextProvider>
              </VestingContextProvider>
            </OnboardingContextProvider>
          </TokenContextProvider>
        </AuthContextProvider>
        {/* </Web3ReactProviderReloaded> */}
      </Web3ReactProvider>
      <div id="react-modal"></div>
    </>
  );
}

export default MyApp;
