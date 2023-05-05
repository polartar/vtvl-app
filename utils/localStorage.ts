import { ILocalStorage } from 'interfaces/locaStorage';

import { CACHE_KEY } from './constants';

export const getCache = () => {
  if (typeof window === 'undefined' || !localStorage.getItem(CACHE_KEY)) return {};
  return JSON.parse(localStorage.getItem(CACHE_KEY) as string) as ILocalStorage;
};

export const setCache = (payload: Partial<ILocalStorage>) => {
  const cache = getCache();

  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, ...payload }));
};
