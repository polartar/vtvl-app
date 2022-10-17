import type { ERC20 } from 'contracts/ERC20';
import ERC20_ABI from 'contracts/abi/ERC20.json';

import { useContract } from './web3';

export default function useTokenContract(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20_ABI);
}
