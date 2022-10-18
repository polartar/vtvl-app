export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  GOERLI = 5,
  KOVAN = 42,
  BINANCE = 56,
  POLYGON = 137,
  AVALANCHE = 43114,
  FANTOM = 250,
  CRONOS = 25
}

export const SupportedChains = {
  [SupportedChainId.MAINNET]: {
    id: 1,
    icon: '/icons/chains/ethereum.svg',
    title: 'Ethereum',
    code: 'ETH',
    rpc: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://etherscan.io',
    multisigTxUrl: 'https://safe-transaction.mainnet.gnosis.io'
  },
  [SupportedChainId.ROPSTEN]: {
    id: 3,
    icon: '/icons/chains/ethereum.svg',
    title: 'Ropsten',
    code: 'ETH',
    rpc: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://ropsten.etherscan.io',
    multisigTxUrl: ''
  },
  [SupportedChainId.GOERLI]: {
    id: 5,
    icon: '/icons/chains/ethereum.svg',
    title: 'Goerli',
    code: 'ETH',
    rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://goerli.etherscan.io',
    multisigTxUrl: 'https://safe-transaction-goerli.safe.global'
  },
  [SupportedChainId.KOVAN]: {
    id: 42,
    icon: '/icons/chains/ethereum.svg',
    title: 'Kovan',
    code: 'ETH',
    rpc: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://kovan.etherscan.io',
    multisigTxUrl: ''
  },
  [SupportedChainId.BINANCE]: {
    id: 56,
    icon: '/icons/chains/bsc.svg',
    title: 'Binance Smart Chain',
    code: 'BSC',
    rpc: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
    multisigTxUrl: 'https://safe-transaction-bsc.safe.global'
  },
  [SupportedChainId.POLYGON]: {
    id: 137,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon',
    code: 'MATIC',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com/',
    multisigTxUrl: 'https://safe-transaction-polygon.safe.global'
  },
  [SupportedChainId.AVALANCHE]: {
    id: 43114,
    icon: '/icons/chains/avalanche.svg',
    title: 'Avalanche',
    code: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: ' https://snowtrace.io',
    multisigTxUrl: 'https://safe-transaction-avalanche.safe.global'
  },
  [SupportedChainId.FANTOM]: {
    id: 250,
    icon: '/icons/chains/fantom.svg',
    title: 'Fantom',
    code: 'FTM',
    rpc: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com/',
    multisigTxUrl: ''
  },
  [SupportedChainId.CRONOS]: {
    id: 25,
    icon: '/icons/chains/cronos.svg',
    title: 'Cronos',
    code: 'CRO',
    rpc: 'https://evm.cronos.org',
    explorer: 'https://cronos.crypto.org/explorer',
    multisigTxUrl: ''
  }
};
