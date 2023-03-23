import Decimal from 'decimal.js';
import { BigNumberish, Contract, ethers, utils } from 'ethers';

/** This is intended to actually parse the amount into tokens */
export const parseTokenAmount = (amountTokens: string | number, decimals?: number) => {
  return utils.parseUnits(amountTokens.toString(), decimals).toString();
};

/** This is intended to format numbers for DISPLAY only */
export const formatNumber = (number: number | Decimal | ethers.BigNumber, decimalPlaces = 6) => {
  const formattedNumber = Number(number).toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces
  });
  if (formattedNumber === 'NaN' || number <= 0) return '0';
  return formattedNumber;
};
