import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { SUPPORTED_CHAIN_IDS, SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
});

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    [SupportedChainId.BINANCE]: SupportedChains[SupportedChainId.BINANCE].rpc,
    [SupportedChainId.POLYGON]: SupportedChains[SupportedChainId.POLYGON].rpc,
    [SupportedChainId.AVALANCHE]: SupportedChains[SupportedChainId.AVALANCHE].rpc,
    [SupportedChainId.FANTOM]: SupportedChains[SupportedChainId.FANTOM].rpc,
    [SupportedChainId.CRONOS]: SupportedChains[SupportedChainId.CRONOS].rpc,
    [SupportedChainId.MUMBAI]: SupportedChains[SupportedChainId.MUMBAI].rpc,
    [SupportedChainId.GOERLI]: SupportedChains[SupportedChainId.GOERLI].rpc
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});

export const network = new NetworkConnector({
  urls: {
    [SupportedChainId.BINANCE]: SupportedChains[SupportedChainId.BINANCE].rpc,
    [SupportedChainId.POLYGON]: SupportedChains[SupportedChainId.POLYGON].rpc,
    [SupportedChainId.AVALANCHE]: SupportedChains[SupportedChainId.AVALANCHE].rpc,
    [SupportedChainId.FANTOM]: SupportedChains[SupportedChainId.FANTOM].rpc,
    [SupportedChainId.CRONOS]: SupportedChains[SupportedChainId.CRONOS].rpc,
    [SupportedChainId.MUMBAI]: SupportedChains[SupportedChainId.MUMBAI].rpc
  },
  defaultChainId: 1
});
