import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import {
  DEV_SUPPORTED_CHAIN_IDS,
  SUPPORTED_CHAIN_IDS,
  SupportedChains,
  devSupportedChains
} from 'types/constants/supported-chains';

export const injected = new InjectedConnector({
  supportedChainIds: DEV_SUPPORTED_CHAIN_IDS
});

const rpcs: { [chainId: number]: string } = {};
DEV_SUPPORTED_CHAIN_IDS.forEach((chainId) => {
  rpcs[chainId] = devSupportedChains[chainId].rpc;
});

export const walletconnect = new WalletConnectConnector({
  rpc: rpcs,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});

export const network = new NetworkConnector({
  urls: rpcs,
  defaultChainId: 1
});
