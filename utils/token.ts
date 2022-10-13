import { BigNumberish, Contract, utils } from 'ethers';

export const parseTokenAmount = (amountTokens: string | number, decimals?: number) => {
  return utils.parseUnits(amountTokens.toString(), decimals).toString();
};
