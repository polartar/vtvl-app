import { useAuthContext } from '@providers/auth.context';
import { useQuery } from '@tanstack/react-query';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { IRecipientDoc } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';
import { removeDuplication } from 'utils/shared';

/**
 * Get recipients data by connected wallet and chainId
 */
export const useMyRecipes = () => {
  const { chainId, account } = useWeb3React();
  const { user, recipient } = useAuthContext();
  const email = user?.memberInfo?.email;

  const { isLoading: isLoadingMyRecipes, data: myRecipes } = useQuery<IRecipientDoc[]>(
    [QUERY_KEYS.RECIPIENT.MINE, chainId, account, email, recipient?.data.walletAddress],
    () =>
      email
        ? fetchRecipientsByQuery(['chainId', 'walletAddress', 'email'], ['==', '==', '=='], [chainId, account, email])
        : fetchRecipientsByQuery(['chainId', 'walletAddress'], ['==', '=='], [chainId, account]),
    {
      enabled: !!chainId && !!account
    }
  );

  const myVestingIds = useMemo(
    () =>
      removeDuplication(
        myRecipes?.map((recipie) => recipie.data.vestingId)?.filter((vestingId) => Boolean(vestingId))
      ) ?? [],
    [myRecipes]
  );

  const myOrganizationIds = useMemo(
    () =>
      removeDuplication(
        myRecipes?.map((recipie) => recipie.data.organizationId)?.filter((organizationId) => Boolean(organizationId))
      ) ?? [],
    [myRecipes]
  );

  const schedulesByOrganization = useMemo(
    () =>
      myRecipes?.reduce((result, recipie) => {
        const organizationId = recipie.data.organizationId;
        return {
          ...result,
          [organizationId]: Number(result[organizationId] ?? 0) + 1
        };
      }, {} as { [key: string]: number }) ?? {},
    [myRecipes]
  );

  return useMemo(
    () => ({
      isLoadingMyRecipes,
      myRecipes: myRecipes ?? [],
      myVestingIds,
      myOrganizationIds,
      schedulesByOrganization
    }),
    [isLoadingMyRecipes, myRecipes, myVestingIds, myOrganizationIds, schedulesByOrganization]
  );
};
