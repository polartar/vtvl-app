import { BigNumberish, Contract, utils } from 'ethers';

export const parseTokenAmount = (amountTokens: string | number, decimals?: number) => {
  return utils.parseUnits(amountTokens.toString(), decimals).toString();
};

export const formatNumber = (number: number) => {
  return Number(number).toLocaleString('en', {minimumFractionDigits: 0, maximumFractionDigits: 6})
}