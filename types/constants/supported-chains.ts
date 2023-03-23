const env = process.env.VERCEL_ENV || process.env.NODE_ENV;

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  BINANCE = 56,
  POLYGON = 137,
  MUMBAI = 80001,
  AVALANCHE = 43113,
  FANTOM = 250,
  FANTOM_TESTNET = 4002,
  CRONOS = 25,
  CRONOS_TESTNET = 338,
  OKC_MAINNET = 66,
  OKC_TESTNET = 65,
  BASE_GOERLI = 84531
}

export const PROD_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.BINANCE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.FANTOM,
  SupportedChainId.CRONOS,
  SupportedChainId.OKC_MAINNET,
  SupportedChainId.OKC_TESTNET
];

export const DEV_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.GOERLI,
  SupportedChainId.MUMBAI,
  SupportedChainId.OKC_TESTNET,
  SupportedChainId.BASE_GOERLI,
  SupportedChainId.FANTOM_TESTNET,
  SupportedChainId.CRONOS_TESTNET,
  SupportedChainId.OKC_MAINNET,
  SupportedChainId.OKC_TESTNET
];

export const SUPPORTED_CHAIN_IDS = env === 'production' ? PROD_SUPPORTED_CHAIN_IDS : DEV_SUPPORTED_CHAIN_IDS;

type ProdSupportedChainIds = typeof PROD_SUPPORTED_CHAIN_IDS[number];
type DevSupportedChainIds = typeof DEV_SUPPORTED_CHAIN_IDS[number];

interface Network {
  id: number;
  icon: string;
  title: string;
  code: string;
  rpc: string;
  explorer: string;
  multisigTxUrl: string;
}

type ProdSupportedChainsType = {
  [P in ProdSupportedChainIds]: Network;
};

type DevSupportedChainsType = {
  [P in DevSupportedChainIds]: Network;
};

type SupportedChainsType = OnlyOne<ProdSupportedChainsType, DevSupportedChainsType>;

export const prodSupportedChains: SupportedChainsType = {
  [SupportedChainId.MAINNET]: {
    id: 1,
    icon: '/icons/chains/ethereum.svg',
    title: 'Ethereum',
    code: 'ETH',
    rpc: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://etherscan.io',
    multisigTxUrl: 'https://safe-transaction.mainnet.gnosis.io'
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
  },
  [SupportedChainId.MUMBAI]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: 'https://safe-transaction-polygon.safe.global'
  },
  [SupportedChainId.OKC_MAINNET]: {
    id: 66,
    icon: '/icons/chains/okc.png',
    title: 'OKC Mainnet',
    code: 'OKT',
    rpc: 'https://exchainrpc.okex.org',
    explorer: 'https://www.oklink.com/en/okc',
    multisigTxUrl: ''
  },
  [SupportedChainId.OKC_TESTNET]: {
    id: 65,
    icon: '/icons/chains/okc.png',
    title: 'OKC Testnet',
    code: 'OKT',
    rpc: 'https://exchaintestrpc.okex.org/',
    explorer: 'https://www.oklink.com/en/okc-test',
    multisigTxUrl: ''
  }
};

export const devSupportedChains: SupportedChainsType = {
  [SupportedChainId.MAINNET]: {
    id: 5,
    icon: '/icons/chains/ethereum.svg',
    title: 'Mainnet-Test',
    code: 'ETH',
    rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://goerli.etherscan.io',
    multisigTxUrl: 'https://safe-transaction-goerli.safe.global'
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
  [SupportedChainId.BINANCE]: {
    id: 97,
    icon: '/icons/chains/bsc.svg',
    title: 'Binance Smart Chain Testnet',
    code: 'BSC',
    rpc: 'https://speedy-nodes-nyc.moralis.io/476f8ed27ca8c180ebc32f48/bsc/testnet',
    explorer: 'https://testnet.bscscan.com',
    multisigTxUrl: ''
  },
  [SupportedChainId.MUMBAI]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: 'https://safe-transaction-polygon.safe.global'
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
    id: 43113,
    icon: '/icons/chains/avalanche.svg',
    title: 'Avalanche Testnet',
    code: 'AVAX',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io/',
    multisigTxUrl: ''
  },
  [SupportedChainId.FANTOM]: {
    id: 4002,
    icon: '/icons/chains/fantom.svg',
    title: 'Fantom Testnet',
    code: 'FTM',
    rpc: 'https://rpc.testnet.fantom.network/',
    explorer: 'https://ftmscan.com/',
    multisigTxUrl: ''
  },
  [SupportedChainId.CRONOS]: {
    id: 338,
    icon: '/icons/chains/cronos.svg',
    title: 'Cronos Testnet',
    code: 'CRO',
    rpc: 'https://cronos-testnet-3.crypto.org:8545/',
    explorer: 'https://cronos.crypto.org/explorer/testnet3/',
    multisigTxUrl: ''
  },
  [SupportedChainId.MUMBAI]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: 'https://safe-transaction-polygon.safe.global'
  },
  [SupportedChainId.OKC_MAINNET]: {
    id: 66,
    icon: '/icons/chains/okc.png',
    title: 'OKC Mainnet',
    code: 'OKT',
    rpc: 'https://exchainrpc.okex.org',
    explorer: 'https://www.oklink.com/en/okc',
    multisigTxUrl: ''
  },
  [SupportedChainId.OKC_TESTNET]: {
    id: 65,
    icon: '/icons/chains/okc.png',
    title: 'OKC Testnet',
    code: 'OKT',
    rpc: 'https://exchaintestrpc.okex.org/',
    explorer: 'https://www.oklink.com/en/okc-test',
    multisigTxUrl: ''
  },
  [SupportedChainId.BASE_GOERLI]: {
    id: 84531,
    icon: '/icons/chains/base.svg',
    title: 'Base Goerli',
    code: 'BASE',
    rpc: 'https://goerli.base.org/',
    explorer: 'https://goerli.basescan.org',
    multisigTxUrl: ''
  }
};

export const SupportedChains = env === 'production' ? prodSupportedChains : devSupportedChains;
