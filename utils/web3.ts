import { ethers } from 'ethers';

export const truncateAddress = (address: string) => {
  if (!address) return 'No Account';
  const match = address.match(/^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const toHex = (num: any) => {
  const val = Number(num);
  return '0x' + val.toString(16);
};

export const BNToAmountString = (v: ethers.BigNumber, decimals = 2) => {
  return parseFloat(ethers.utils.formatEther(v)).toFixed(decimals);
};

export const truncateEmail = (email: string) => {
  if (!email) return 'No Email';

  const splitted = email.split('@');
  let head = splitted[0];
  if (head.length > 6) {
    head = `${head.slice(0, 2)}...${head.slice(head.length - 2, head.length)}`;
  }
  return `${head}@${splitted[1]}`;
};
