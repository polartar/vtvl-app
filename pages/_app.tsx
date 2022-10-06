import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import type { AppProps } from 'next/app';
import React from 'react';

import { DefaultLayout } from '../components/layout/DefaultLayout';
import { AuthContextProvider } from '../providers/auth.context';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={(provider: any) => new ethers.providers.Web3Provider(provider)}>
      <AuthContextProvider>
        <DefaultLayout>
          <Component {...pageProps} />
        </DefaultLayout>
      </AuthContextProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
