import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { SUPPORTED_CHAIN_IDS, SupportedChains } from 'types/constants/supported-chains';

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
});

const rpcs: { [chainId: number]: string } = {};
SUPPORTED_CHAIN_IDS.forEach((chainId) => {
  rpcs[chainId] = SupportedChains[chainId].rpc;
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
