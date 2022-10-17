import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

export const injected = new InjectedConnector({
  supportedChainIds: [
    SupportedChainId.MAINNET,
    SupportedChainId.ROPSTEN,
    SupportedChainId.GOERLI,
    SupportedChainId.KOVAN,
    SupportedChainId.BINANCE,
    SupportedChainId.POLYGON,
    SupportedChainId.AVALANCHE,
    SupportedChainId.FANTOM,
    SupportedChainId.CRONOS
  ]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}` },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});

export const network = new NetworkConnector({
  urls: {
    [SupportedChainId.BINANCE]: SupportedChains[SupportedChainId.BINANCE].rpc,
    [SupportedChainId.POLYGON]: SupportedChains[SupportedChainId.POLYGON].rpc,
    [SupportedChainId.AVALANCHE]: SupportedChains[SupportedChainId.AVALANCHE].rpc,
    [SupportedChainId.FANTOM]: SupportedChains[SupportedChainId.FANTOM].rpc,
    [SupportedChainId.CRONOS]: SupportedChains[SupportedChainId.CRONOS].rpc
  },
  defaultChainId: 1
});
