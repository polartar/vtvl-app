// import { WalletConnectV2Connector } from '@web3-react/walletconnect-connector';
import { WalletConnectV2Connector } from '@connectors/WalletConnectV2';
import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import {
  DEV_SUPPORTED_CHAIN_IDS,
  SUPPORTED_CHAIN_IDS,
  SupportedChains,
  devSupportedChains
} from 'types/constants/supported-chains';
import { WALLET_CONNECT_V2_PROJECT_ID } from 'utils/constants';

export const injected = new InjectedConnector({
  supportedChainIds: DEV_SUPPORTED_CHAIN_IDS
});

const rpcs: { [chainId: number]: string } = {};
DEV_SUPPORTED_CHAIN_IDS.forEach((chainId) => {
  rpcs[chainId] = devSupportedChains[chainId].rpc;
});

const [chain, ...optionalChains] = Object.keys(devSupportedChains).map(Number);

export const walletconnect = new WalletConnectV2Connector({
  projectId: WALLET_CONNECT_V2_PROJECT_ID,
  rpcMap: rpcs,
  chains: [chain],
  optionalChains,
  showQrModal: true
});

export const network = new NetworkConnector({
  urls: rpcs,
  defaultChainId: 1
});
