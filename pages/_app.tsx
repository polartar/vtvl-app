import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { AuthContextProvider } from "../providers/auth.context";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider
      getLibrary={(provider: any) =>
        new ethers.providers.Web3Provider(provider)
      }
    >
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
