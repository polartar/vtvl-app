export const arraySort = (arr: any[], field: string): any[] => {
  return arr.sort((a, b) => (a[field] > b[field] ? 1 : b[field] > a[field] ? -1 : 0));
};
