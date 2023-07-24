import ThemeLoader from '@components/atoms/ThemeLoader/ThemeLoader';
import DefaultLayout from '@components/organisms/Layout/DefaultLayout';
import { Web3Provider } from '@ethersproject/providers';
import { AuthContextProvider } from '@providers/auth.context';
import { ClaimTokensContextProvider } from '@providers/claim-tokens.context';
import { DashboardContextProvider } from '@providers/dashboard.context';
import { GlobalContextProvider } from '@providers/global.context';
import { LoaderContextProvider } from '@providers/loader.context';
import { OnboardingContextProvider } from '@providers/onboarding.context';
import { TeammateContextProvider } from '@providers/teammate.context';
import { TokenContextProvider } from '@providers/token.context';
import { VestingContextProvider } from '@providers/vesting.context';
import { useAuth } from '@store/useAuth';
// react-query imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3ReactProvider } from '@web3-react/core';
import { AnimatePresence, motion } from 'framer-motion';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { TransactionLoaderContextProvider } from 'providers/transaction-loader.context';
import React, { ReactElement, ReactNode, useEffect } from 'react';
// Todo: Arvin #18 - Explore styles that can be customized / override to conform with VTVL branding.
// React datepicker initial styling.
import 'react-datepicker/dist/react-datepicker.css';
import { hotjar } from 'react-hotjar';
// Skeleton loader styles
import 'react-loading-skeleton/dist/skeleton.css';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';
// Toast initial styling.
import 'react-toastify/dist/ReactToastify.css';
import 'styles/globals.css';

// Create a client
const queryClient = new QueryClient();

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
  const router = useRouter();
  const { checkAccessTokenValidity } = useAuth();

  useEffect(() => {
    hotjar.initialize(Number(process.env.NEXT_PUBLIC_HOTJAR_HJID), Number(process.env.NEXT_PUBLIC_HOTJAR_HJSV));
  }, []);

  Modal.setAppElement('#react-modal');
  // Use the layout defined at the page level, if available
  // Make way for the contextAPI to update the sidebar and connected states of the user in the default layout.
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    checkAccessTokenValidity();
  }, []);

  return (
    <>
      <Web3ReactProvider getLibrary={(provider: any) => getLibrary(provider)}>
        <QueryClientProvider client={queryClient}>
          <GlobalContextProvider>
            <AuthContextProvider>
              <LoaderContextProvider>
                <TokenContextProvider>
                  <OnboardingContextProvider>
                    <VestingContextProvider>
                      <DashboardContextProvider>
                        <TransactionLoaderContextProvider>
                          <TeammateContextProvider>
                            <ClaimTokensContextProvider>
                              <AnimatePresence mode="wait">
                                <DefaultLayout>{getLayout(<Component {...pageProps} />)}</DefaultLayout>
                              </AnimatePresence>
                              <ToastContainer autoClose={6000} style={{ top: '6rem', right: '1rem' }} />
                            </ClaimTokensContextProvider>
                          </TeammateContextProvider>
                        </TransactionLoaderContextProvider>
                      </DashboardContextProvider>
                    </VestingContextProvider>
                  </OnboardingContextProvider>
                </TokenContextProvider>
              </LoaderContextProvider>
            </AuthContextProvider>
          </GlobalContextProvider>
        </QueryClientProvider>
        {/* </Web3ReactProviderReloaded> */}
      </Web3ReactProvider>
      <div id="react-modal"></div>
    </>
  );
}

export default MyApp;
