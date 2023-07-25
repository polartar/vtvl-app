export const arraySort = (arr: any[], field: string): any[] => {
  return arr.sort((a, b) => (a[field] > b[field] ? 1 : b[field] > a[field] ? -1 : 0));
};

export const truncateComma = (value: string) => value?.split(',')?.join('') ?? '';

export const compareAddresses = (address1: string | null, address2: string | null) =>
  address1?.toLowerCase() === address2?.toLowerCase();
