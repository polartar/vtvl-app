import ERC20_ABI from "types/abi/ERC20.json";
import type { ERC20 } from "types/web3/ERC20";
import { useContract } from "./web3";

export default function useTokenContract(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20_ABI);
}
