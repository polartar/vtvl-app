import RecipientApiService from '@api-services/RecipientApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { IRecipient } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';

export const useRecipientsByQuery = (query: string) => {
  const { isLoading, data } = useQuery<IRecipient[]>(
    [QUERY_KEYS.RECIPIENT.ALL, query],
    async () => RecipientApiService.getRecipients(query || ''),
    {
      enabled: !!query
    }
  );

  return useMemo(
    () => ({
      isLoading,
      recipients: data ?? []
    }),
    [isLoading, data]
  );
};
