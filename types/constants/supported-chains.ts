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

interface Network {
  id: number;
  icon: string;
  title: string;
  code: string;
  rpc: string;
  explorer: string;
  multisigTxUrl: string;
}
type SupportedChainsType = {
  [P in SupportedChainId]: Network;
};

const prodSupportedChains: SupportedChainsType = {
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

const devSupportedChains: SupportedChainsType = {
  [SupportedChainId.MAINNET]: {
    id: 5,
    icon: '/icons/chains/ethereum.svg',
    title: 'Mainnet-Test',
    code: 'ETH',
    rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://goerli.etherscan.io',
    multisigTxUrl: 'https://safe-transaction-goerli.safe.global'
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
    rpc: 'https://sokol.poa.network/',
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
    title: 'Binance Smart Chain Testnet',
    code: 'BSC',
    rpc: 'https://speedy-nodes-nyc.moralis.io/476f8ed27ca8c180ebc32f48/bsc/testnet',
    explorer: 'https://testnet.bscscan.com',
    multisigTxUrl: ''
  },
  [SupportedChainId.POLYGON]: {
    id: 80001,
    icon: '/icons/chains/polygon.svg',
    title: 'Polygon Mumbai Testnet',
    code: 'MATIC',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    multisigTxUrl: ''
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
  }
};

const env = process.env.VERCEL_ENV || process.env.NODE_ENV;
console.log("env var here is ", env)
export const SupportedChains = env === 'production' ? prodSupportedChains : devSupportedChains;
