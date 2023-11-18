import TokenApiService from '@api-services/TokenApiService';
import { useAuth } from '@store/useAuth';
import { useWeb3React } from '@web3-react/core';
import Decimal from 'decimal.js';
import { useMyRecipes } from 'hooks/useRecipients';
import { useVestingsFromIds } from 'hooks/useVestings';
import { IToken } from 'interfaces/token';
import { useRouter } from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IVesting } from 'types/models';
import { TUserTokenDetails } from 'types/models/token';
import { getActualDateTime, getUserTokenDetails } from 'utils/shared';

import { useAuthContext } from './auth.context';

interface IClaimTokensData {
  tokens: IToken[];
  vestingSchedules: { id: string; data: IVesting }[];
  selectedSchedule: { id: string; data: IVesting } | undefined;
  selectedToken: IToken | undefined;
  userTokenDetails: TUserTokenDetails;
  setSelectedSchedule: (data: any) => void;
  fetchContract: () => void;
}

const ClaimTokensContext = createContext({} as IClaimTokensData);

/**
 * Provider for the Claim tokens context
 * This will store the current users claimable tokens and their details
 * along with the vesting schedule details tied from the claimable tokens possible on different organizations.
 *
 * What should we store here?
 * - Claimable tokens list
 *  - Details like Claimable, Claimed, Withdrawn, Next cycle
 * - Vesting schedules to get the release details for the charts
 *  - How much time left before the next release
 *  - How much time left before completion
 * - Currently viewed vesting schedule details
 *  - When a user selects a schedule in the Claims portal Sidebar
 *  - OR when a user directly uses a link to the token being claimed using the vesting schedule ID
 */

export function ClaimTokensContextProvider({ children }: any) {
  // To check if the current user already has a connected wallet
  const { account, chainId } = useWeb3React();

  const { user } = useAuthContext();

  const { accessToken } = useAuth();

  const router = useRouter();
  // schedule = document id of the vesting schedule
  const { schedule } = router.query;

  // Stores the currently available organizations based on the claimable tokens of the user
  // const [organizations, setOrganizations] = useState<{ [key: string]: boolean }>({});

  // Stores the claimable tokens of the current user
  const [tokens, setTokens] = useState<IToken[]>([]);

  // Stores the selected token based on the selected schedule
  const [selectedToken, setSelectedToken] = useState<IToken | undefined>();

  // Stores the list of vesting schedules based on claimable tokens of the user
  // const [vestingSchedules, setVestingSchedules] = useState<{ id: string; data: IVesting }[]>([]);

  // Stores the currently selected schedule details along with the claimable token
  const [selectedSchedule, setSelectedSchedule] = useState<{ id: string; data: IVesting }>();

  // Stores the essential data for the individual user based on the current selected schedule
  const [userTokenDetails, setUserTokenDetails] = useState<TUserTokenDetails>({
    name: '',
    symbol: '',
    totalAllocation: new Decimal(0),
    cliffAmount: new Decimal(0),
    releaseAmount: new Decimal(0),
    claimableAmount: new Decimal(0),
    claimedAmount: new Decimal(0),
    remainingAmount: new Decimal(0),
    vestedAmount: new Decimal(0),
    vestingProgress: 0,
    cliffDate: '',
    numberOfReleases: 0,
    vestingContractAddress: '',
    lockedTokens: new Decimal(0)
  });

  const { myVestingIds, myOrganizationIds } = useMyRecipes();
  const { vestings: vestingSchedules } = useVestingsFromIds(myVestingIds);

  const organizations = useMemo(
    () => myOrganizationIds.reduce((result, orgId) => ({ ...result, [orgId]: true }), {}),
    [myOrganizationIds]
  );

  // A function that gets the vesting contract for the user
  const fetchContract = useCallback(async () => {
    if (selectedSchedule && account && chainId) {
      const tokenDetails = await getUserTokenDetails(selectedSchedule, account, chainId);
      setUserTokenDetails({ ...userTokenDetails, ...tokenDetails });
    }
  }, [selectedSchedule, account, chainId]);

  // Gets the token details
  const getTokenDetails = useCallback(async () => {
    if (selectedSchedule && selectedSchedule.data) {
      try {
        const getTokenFromDB = await TokenApiService.getTokens();
        console.log('Token', getTokenFromDB);
        if (getTokenFromDB) {
          setSelectedToken(
            getTokenFromDB.find(
              (token) =>
                token.chainId === chainId! &&
                token.organizations?.map((org) => org.organizationId).includes(selectedSchedule?.data.organizationId)
            )
          );
        }
      } catch (err) {
        console.error('Getting Token Details Error in ClaimTokensContext: ', err);
      }
    }
  }, [selectedSchedule, chainId]);

  // Stores the token list of the current user
  useEffect(() => {
    if (chainId && organizations && accessToken)
      TokenApiService.getTokens().then((res) => setTokens(res.filter((token) => token.chainId === chainId)));
  }, [organizations, chainId, accessToken]);

  // Watch for route changes that has [schedule]
  useEffect(() => {
    if (schedule && vestingSchedules) {
      const findSchedule = vestingSchedules.find((sched) => sched.id === schedule);
      console.log('Finding schedule', findSchedule);
      if (findSchedule) {
        const actualDateTime = getActualDateTime(findSchedule.data.details);
        // Update the selected schedule dates into JS readable format
        setSelectedSchedule({
          ...findSchedule,
          data: {
            ...findSchedule.data,
            details: {
              ...findSchedule?.data.details,
              startDateTime: actualDateTime.startDateTime,
              endDateTime: actualDateTime.endDateTime
            }
          }
        });
      }
    }
  }, [schedule, vestingSchedules]);

  // Waits for the releaseAmount to finish before fetching other records
  // Fixes the said amounts being defaulted to 0
  useEffect(() => {
    // Get the contract
    fetchContract();
    // Get the current token
    getTokenDetails();
  }, [selectedSchedule, account, chainId]);

  const value = useMemo(
    () => ({
      tokens,
      vestingSchedules,
      selectedSchedule,
      selectedToken,
      userTokenDetails,
      setSelectedSchedule,
      fetchContract
    }),
    [vestingSchedules, selectedSchedule, selectedToken, tokens, userTokenDetails]
  );

  return <ClaimTokensContext.Provider value={value}>{children}</ClaimTokensContext.Provider>;
}

export const useClaimTokensContext = () => ({
  ...useContext(ClaimTokensContext)
});
