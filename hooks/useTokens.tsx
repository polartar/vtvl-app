import { useEffect } from 'react';
import { fetchToken } from 'services/db/token';
import { IToken } from 'types/models';

import { useShallowState } from './useShallowState';

export default function useTokens(tokenIds: string[]) {
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    tokens: Array<{
      id: string;
      data: IToken;
    }>;
  }>({
    isLoading: false,
    tokens: []
  });

  useEffect(() => {
    if (!tokenIds?.length) setState({ tokens: [] });

    setState({ isLoading: true });
    const fetchTokensQuery = tokenIds.map((tokenId) => fetchToken(tokenId));
    Promise.all(fetchTokensQuery)
      .then((res) => {
        const tokens = res
          .map((token, index) => ({
            id: tokenIds[index],
            data: token as IToken
          }))
          .filter((token) => !!token);
        setState({ tokens });
      })
      .catch(console.error)
      .finally(() => setState({ isLoading: false }));
  }, [tokenIds]);

  return state;
}
