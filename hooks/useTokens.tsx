import TokenApiService from '@api-services/TokenApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { IToken } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';

export const useTokensFromIds = (tokenIds: string[]) => {
  const { isLoading: isLoadingTokens, data: tokens } = useQuery(
    [QUERY_KEYS.TOKEN.FROM_IDS],
    () => {
      const fetchTokensQuery = tokenIds.map((tokenId) => TokenApiService.getToken(tokenId));
      return Promise.all(fetchTokensQuery);
    },
    {
      enabled: !!tokenIds?.length,
      select: (data) =>
        data
          ?.map((token, index) => ({
            id: tokenIds[index],
            data: token as IToken
          }))
          ?.filter((token) => Boolean(token.data)) ?? []
    }
  );

  return useMemo(
    () => ({
      isLoadingTokens,
      tokens: tokens ?? []
    }),
    [isLoadingTokens, tokens]
  );
};
