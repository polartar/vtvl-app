import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ethers } from 'ethers';
import { Web3ReactProvider } from '@web3-react/core';
import { AuthContextProvider } from '../providers/auth.context';
import { OnboardingContextProvider } from '../providers/onboarding.context';
import DefaultLayout from '@components/organisms/Layout/DefaultLayout';
import '../styles/globals.css';

// Exporting a layout type for nested layouts
export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  // Make way for the contextAPI to update the sidebar and connected states of the user in the default layout.
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <Web3ReactProvider getLibrary={(provider: any) => provider ? provider : new ethers.providers.Web3Provider(provider)}>
      <AuthContextProvider>
        <OnboardingContextProvider>
          {/* <DefaultLayout sidebar={true} connected={true}> */}
          <DefaultLayout>{getLayout(<Component {...pageProps} />)}</DefaultLayout>
        </OnboardingContextProvider>
      </AuthContextProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
