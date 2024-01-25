const env = process.env.NEXT_PUBLIC_NODE_ENV;
console.log('env', env);
export enum SupportedChainId {
  MAINNET = 1,
  BINANCE = 56,
  BINANCE_TESTNET = 97,
  POLYGON = 137,
  MUMBAI = 80001,
  AVALANCHE = 43113,
  FANTOM = 250,
  FANTOM_TESTNET = 4002,
  CRONOS = 25,
  CRONOS_TESTNET = 338,
  OKC_MAINNET = 66,
  OKC_TESTNET = 65,
  BASE_GOERLI = 84531,
  SATOSHI_MAINNET = 12009,
  GANACHE_NETWORK = 999,
  OPTIMISM_MAINNET = 10,
  OPTIMISM_GOERLI = 420,
  SEPOLIA = 11155111
}

export const PROD_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.BINANCE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.FANTOM,
  SupportedChainId.CRONOS,
  SupportedChainId.OKC_MAINNET,
  SupportedChainId.SATOSHI_MAINNET,
  SupportedChainId.OPTIMISM_MAINNET
];

export const DEMO_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MUMBAI,
  SupportedChainId.OKC_TESTNET,
  SupportedChainId.BASE_GOERLI,
  SupportedChainId.BINANCE_TESTNET,
  SupportedChainId.OPTIMISM_GOERLI,
  SupportedChainId.SEPOLIA
];

export const DEV_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.BINANCE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.FANTOM,
  SupportedChainId.CRONOS,
  SupportedChainId.OKC_MAINNET,
  SupportedChainId.MUMBAI,
  SupportedChainId.OKC_TESTNET,
  SupportedChainId.BASE_GOERLI,
  SupportedChainId.SATOSHI_MAINNET,
  SupportedChainId.BINANCE_TESTNET,
  SupportedChainId.GANACHE_NETWORK,
  SupportedChainId.OPTIMISM_GOERLI,
  SupportedChainId.SEPOLIA
];

export const SUPPORTED_CHAIN_IDS =
  env === 'production' ? PROD_SUPPORTED_CHAIN_IDS : env === 'demo' ? DEMO_SUPPORTED_CHAIN_IDS : DEV_SUPPORTED_CHAIN_IDS;

export interface Network {
  id: number;
  icon: string;
  title: string;
  code: string;
  rpc: string;
  explorer: string;
  multisigTxUrl: string;
}

type ChainsType = {
  [network: number]: Network;
};

export const prodSupportedChains: ChainsType = {
  [SupportedChainId.MAINNET]: {
    id: 1,
    icon: '/icons/chains/ethereum.svg',
    title: 'Ethereum',
    code: 'ETH',
    rpc: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://etherscan.io',
    multisigTxUrl: 'https://safe-transaction-mainnet.safe.global'
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
    rpc: 'https://polygon.llamarpc.com',
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
    title: 'Cronos Mainnet Beta',
    code: 'CRO',
    rpc: 'https://evm.cronos.org',
    explorer: 'https://cronos.crypto.org/explorer',
    multisigTxUrl: ''
  },

  [SupportedChainId.OKC_MAINNET]: {
    id: 66,
    icon: '/icons/chains/okc.png',
    title: 'OKXChain Mainnet',
    code: 'OKT',
    rpc: 'https://exchainrpc.okex.org',
    explorer: 'https://www.oklink.com/en/okc',
    multisigTxUrl: ''
  },
  [SupportedChainId.SATOSHI_MAINNET]: {
    id: 12009,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9022.png',
    title: 'Satoshi Chain',
    code: 'SATS',
    rpc: 'https://mainnet-rpc.satoshichain.io',
    explorer: 'https://satoshiscan.io',
    multisigTxUrl: ''
  },
  [SupportedChainId.OPTIMISM_MAINNET]: {
    id: 10,
    icon: '/icons/chains/optimism.png',
    title: 'OP Mainnet',
    code: 'ETH',
    rpc: 'https://mainnet.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    multisigTxUrl: 'https://safe-transaction-optimism.safe.global/'
  }
};

export const demoSupportedChains: ChainsType = {
  [SupportedChainId.MUMBAI]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: ''
  },
  [SupportedChainId.OKC_TESTNET]: {
    id: 65,
    icon: '/icons/chains/okc.png',
    title: 'OKExChain Testnet',
    code: 'OKT',
    rpc: 'https://exchaintestrpc.okex.org/',
    explorer: 'https://www.oklink.com/en/okc-test',
    multisigTxUrl: ''
  },
  [SupportedChainId.BASE_GOERLI]: {
    id: 84531,
    icon: '/icons/chains/ethereum.svg',
    title: 'Base Goerli',
    code: 'BASE',
    rpc: 'https://goerli.base.org/',
    explorer: 'https://goerli.basescan.org',
    multisigTxUrl: ''
  },
  [SupportedChainId.BINANCE_TESTNET]: {
    id: 97,
    icon: '/icons/chains/bsc.svg',
    title: 'Binance Testnet',
    code: 'BNB',
    rpc: 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com/',
    multisigTxUrl: ''
  },
  [SupportedChainId.OPTIMISM_GOERLI]: {
    id: 420,
    icon: '/icons/chains/optimism.png',
    title: 'Optimism Goerli Testnet',
    code: 'ETH',
    rpc: 'https://goerli.optimism.io',
    explorer: 'https://goerli-optimism.etherscan.io/',
    multisigTxUrl: ''
  },
  [SupportedChainId.SEPOLIA]: {
    id: 11155111,
    icon: '/icons/chains/ethereum.svg',
    title: 'Sepolia',
    code: 'ETH',
    rpc: 'https://ethereum-sepolia.publicnode.com',
    explorer: 'https://sepolia.etherscan.io',
    multisigTxUrl: 'https://safe-transaction-sepolia.safe.global/'
  }
};

export const devSupportedChains: ChainsType = {
  [SupportedChainId.MAINNET]: {
    id: 1,
    icon: '/icons/chains/ethereum.svg',
    title: 'Ethereum',
    code: 'ETH',
    rpc: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://etherscan.io',
    multisigTxUrl: 'https://safe-transaction-mainnet.safe.global'
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
    rpc: 'https://polygon.llamarpc.com',
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
    title: 'Cronos Mainnet Beta',
    code: 'CRO',
    rpc: 'https://evm.cronos.org',
    explorer: 'https://cronos.crypto.org/explorer',
    multisigTxUrl: ''
  },

  [SupportedChainId.OKC_MAINNET]: {
    id: 66,
    icon: '/icons/chains/okc.png',
    title: 'OKXChain Mainnet',
    code: 'OKT',
    rpc: 'https://exchainrpc.okex.org',
    explorer: 'https://www.oklink.com/en/okc',
    multisigTxUrl: ''
  },
  [SupportedChainId.MUMBAI]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: ''
  },
  [SupportedChainId.OKC_TESTNET]: {
    id: 65,
    icon: '/icons/chains/okc.png',
    title: 'OKExChain Testnet',
    code: 'OKT',
    rpc: 'https://exchaintestrpc.okex.org/',
    explorer: 'https://www.oklink.com/en/okc-test',
    multisigTxUrl: ''
  },
  [SupportedChainId.BASE_GOERLI]: {
    id: 84531,
    icon: '/icons/chains/ethereum.svg',
    title: 'Base Goerli',
    code: 'BASE',
    rpc: 'https://goerli.base.org/',
    explorer: 'https://goerli.basescan.org',
    multisigTxUrl: ''
  },
  [SupportedChainId.SATOSHI_MAINNET]: {
    id: 12009,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9022.png',
    title: 'Satoshi Chain',
    code: 'SATS',
    rpc: 'https://mainnet-rpc.satoshichain.io',
    explorer: 'https://satoshiscan.io',
    multisigTxUrl: ''
  },
  [SupportedChainId.BINANCE_TESTNET]: {
    id: 97,
    icon: '/icons/chains/bsc.svg',
    title: 'BNB Smart Chain Testnet',
    code: 'tBNB',
    rpc: 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com/',
    multisigTxUrl: ''
  },
  [SupportedChainId.GANACHE_NETWORK]: {
    id: 999,
    icon: '/icons/chains/ganache.png',
    title: 'Ganache Network',
    code: 'WAN',
    rpc: 'http://13.42.77.252:8545',
    explorer: '',
    multisigTxUrl: ''
  },
  [SupportedChainId.OPTIMISM_GOERLI]: {
    id: 420,
    icon: '/icons/chains/optimism.png',
    title: 'Optimism Goerli Testnet',
    code: 'ETH',
    rpc: 'https://goerli.optimism.io',
    explorer: 'https://goerli-optimism.etherscan.io/',
    multisigTxUrl: ''
  },
  [SupportedChainId.SEPOLIA]: {
    id: 11155111,
    icon: '/icons/chains/ethereum.svg',
    title: 'Sepolia',
    code: 'ETH',
    rpc: 'https://ethereum-sepolia.publicnode.com',
    explorer: 'https://sepolia.etherscan.io',
    multisigTxUrl: 'https://safe-transaction-sepolia.safe.global/'
  }
};

export const AllChains = devSupportedChains;

export const SupportedChains =
  env === 'production' ? prodSupportedChains : env === 'demo' ? demoSupportedChains : devSupportedChains;

export const SafeSupportedChains = [1, 11155111, 56, 137];
