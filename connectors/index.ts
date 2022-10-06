import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import { SupportedChainId } from '../types/constants/supported-chains';

export const injected = new InjectedConnector({
  supportedChainIds: [
    SupportedChainId.MAINNET,
    SupportedChainId.ROPSTEN,
    SupportedChainId.RINKEBY,
    SupportedChainId.GOERLI,
    SupportedChainId.KOVAN
  ]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}` },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});
