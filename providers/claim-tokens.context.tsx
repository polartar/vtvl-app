import ERC20 from '@contracts/abi/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchTokenByQuery } from 'services/db/token';
import { fetchAllVestingsWithId } from 'services/db/vesting';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IToken, IVesting } from 'types/models';
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
 * along with the vesting schedule details tied from the claimable tokens possbile on different organizations.
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
  const { account, chainId, library } = useWeb3React();

  const { user } = useAuthContext();

  const router = useRouter();
  // schedule = document id of the vesting schedule
  const { schedule } = router.query;

  // Gets the current organization ID of the user
  const { organizationId } = useAuthContext();

  // Stores the currently available organizations based on the claimable tokens of the user
  const [organizations, setOrganizations] = useState<{ [key: string]: boolean }>({});

  // Stores the claimable tokens of the current user
  const [tokens, setTokens] = useState<IToken[]>([]);

  // Stores the selected token based on the selected schedule
  const [selectedToken, setSelectedToken] = useState<IToken | undefined>();

  // Stores the list of vesting schedules based on claimable tokens of the user
  const [vestingSchedules, setVestingSchedules] = useState<{ id: string; data: IVesting }[]>([]);

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

  // A function that will get all organization the current user belongs to / have claimable tokens
  const fetchOrganizations = async () => {
    const vestings = await fetchAllVestingsWithId();
    // MOCK FEATURE
    // if (vestings && vestings.length > 0) {
    if (vestings && vestings.length > 0 && account) {
      vestings.forEach((vesting) => {
        if (
          vesting.data.recipients &&
          vesting.data.recipients.length > 0 &&
          vesting.data.recipients.find((recipient) => recipient.walletAddress.toLowerCase() === account.toLowerCase())
          // MOCK DATA
          // vesting.data.recipients.find(
          //   (recipient) =>
          //     recipient.walletAddress.toLowerCase() === '0x821C2d64f6c9a9E15Cdd81f3D952884740BC013E'.toLowerCase()
          // )
        ) {
          setOrganizations({
            ...organizations,
            [vesting.data.organizationId]: true
          });

          // Attach the vesting name or generated name in the vesting schedule key
          // In case that there are multiple schedules that the current user can claim
          // This is so that we can list every schedule down to the sidebar
          // Check if there is already the same schedule in the list
          const isAlreadyExisting = vestingSchedules.find((sched) => sched.id === vesting.id);
          if (!isAlreadyExisting) {
            setVestingSchedules([...vestingSchedules, vesting]);
          }
        }
      });
    }
  };

  // A function that gets the vesting contract for the user
  const fetchContract = async () => {
    if (selectedSchedule && account && chainId) {
      const tokenDetails = await getUserTokenDetails(selectedSchedule, account, chainId);
      setUserTokenDetails({ ...userTokenDetails, ...tokenDetails });
    }
    // if (selectedSchedule && selectedSchedule.data && chainId) {
    //   const contractFromDB = await fetchVestingContractByQuery(
    //     ['organizationId', 'chainId'],
    //     ['==', '=='],
    //     [selectedSchedule?.data.organizationId, chainId]
    //   );
    //   console.log('contract from db', contractFromDB);

    //   if (contractFromDB?.data) {
    //     setUserTokenDetails({ ...userTokenDetails, vestingContractAddress: contractFromDB.data.address });
    //     console.log('Contract address', contractFromDB.data);
    //     const vestingContract = await new ethers.Contract(
    //       contractFromDB?.data?.address ?? '',
    //       VTVL_VESTING_ABI.abi,
    //       ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
    //     );

    //     // Get the token details in the blockchain
    //     const tokenDetails = await new ethers.Contract(
    //       contractFromDB?.data?.tokenAddress,
    //       ERC20,
    //       ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
    //     );

    //     const [totalAllocatedToUser, totalClaimableByUser, totalVestedToUser, tokenName, tokenSymbol] =
    //       await Promise.all([
    //         // MOCK DATAS
    //         // vestingContract.finalVestedAmount('0x821C2d64f6c9a9E15Cdd81f3D952884740BC013E'),
    //         // vestingContract.claimableAmount('0x821C2d64f6c9a9E15Cdd81f3D952884740BC013E'),
    //         // vestingContract.vestedAmount('0x821C2d64f6c9a9E15Cdd81f3D952884740BC013E', getUnixTime(new Date())),
    //         vestingContract.finalVestedAmount(account),
    //         vestingContract.claimableAmount(account),
    //         vestingContract.vestedAmount(account, getUnixTime(new Date())),
    //         tokenDetails.name(),
    //         tokenDetails.symbol()
    //       ]);

    //     console.log('Contract ', vestingContract, tokenDetails);

    //     if (totalAllocatedToUser && totalClaimableByUser && totalVestedToUser && tokenName && tokenSymbol) {
    //       // gets the total allocation of an individual user
    //       const totalAllocation = new Decimal(+totalAllocatedToUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);
    //       // gets the currently claimable token of the individual user
    //       const claimableAmount = new Decimal(+totalClaimableByUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);
    //       // gets the total vested amount that the individual user holds
    //       // claimed and unclaimed
    //       const vestedAmount = new Decimal(+totalVestedToUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);
    //       setUserTokenDetails({
    //         ...userTokenDetails,
    //         totalAllocation,
    //         claimableAmount,
    //         vestedAmount,
    //         name: tokenName,
    //         symbol: tokenSymbol
    //       });
    //     }
    //   }
    // }
  };

  // Gets the token details
  const getTokenDetails = async () => {
    if (selectedSchedule && selectedSchedule.data) {
      try {
        const getTokenFromDB = await fetchTokenByQuery(
          ['organizationId', 'chainId'],
          ['==', '=='],
          [selectedSchedule?.data.organizationId, chainId!]
        );
        console.log('Token', getTokenFromDB);
        if (getTokenFromDB && getTokenFromDB.data) {
          setSelectedToken({
            ...getTokenFromDB.data
          });
        }
      } catch (err) {
        // something went wrong
      }
    }
  };

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

  useEffect(() => {
    fetchOrganizations();
    // MOCK FEATURE
    // }, []);
  }, [user, account]);

  // Stores the token list of the current user
  useEffect(() => {
    if (organizations && Object.keys(organizations).length > 0 && chainId) {
      const orgIds = Object.keys(organizations);
      orgIds.map((orgId) => {
        fetchTokenByQuery(['organizationId', 'chainId'], ['==', '=='], [orgId, chainId!]).then((res) => {
          if (res?.data) {
            setTokens([
              ...tokens.filter((token) => token.address.toLowerCase() !== res.data?.address.toLowerCase()),
              res.data
            ]);
          }
        });
      });
    }
  }, [organizations, chainId]);

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

  // Computes user token detail datas based on the current selected schedule
  // useEffect(() => {
  //   if (selectedSchedule && selectedSchedule.data) {
  //     const {
  //       cliffDuration,
  //       lumpSumReleaseAfterCliff,
  //       amountToBeVested,
  //       startDateTime,
  //       endDateTime,
  //       releaseFrequency
  //     } = selectedSchedule.data.details;
  //     const cliffDate = startDateTime ? getCliffDateTime(startDateTime, cliffDuration) : '';
  //     const cliffAmount = getCliffAmountDecimal(
  //       cliffDuration,
  //       new Decimal(lumpSumReleaseAfterCliff),
  //       new Decimal(amountToBeVested)
  //     );
  //     const numberOfReleases =
  //       startDateTime && endDateTime
  //         ? getNumberOfReleases(releaseFrequency, cliffDate || startDateTime, endDateTime)
  //         : 0;

  //     const releaseAmount = getReleaseAmountDecimal(new Decimal(amountToBeVested), cliffAmount, numberOfReleases);

  //     setUserTokenDetails({
  //       ...userTokenDetails,
  //       cliffAmount,
  //       releaseAmount,
  //       cliffDate,
  //       numberOfReleases
  //     });
  //   }
  // }, [selectedSchedule]);

  // Waits for the releaseAmount to finish before fetching other records
  // Fixes the said amounts being defaulted to 0
  useEffect(() => {
    // Get the contract
    fetchContract();
    // Get the current token
    getTokenDetails();
  }, [selectedSchedule, account, chainId]);

  // Computes the claimed, unclaimed and remaining tokens of the individual user
  // useEffect(() => {
  //   const { totalAllocation, claimableAmount, vestedAmount } = userTokenDetails;
  //   // At least one of them is not zero, then let's compute
  //   if (totalAllocation || claimableAmount || vestedAmount) {
  //     const claimedTokens = vestedAmount.greaterThanOrEqualTo(claimableAmount)
  //       ? vestedAmount.minus(claimableAmount)
  //       : new Decimal(0);
  //     const remainingTokens = totalAllocation.minus(vestedAmount.minus(claimedTokens));
  //     const vestingProgress = +vestedAmount.div(totalAllocation) * 100;
  //     setUserTokenDetails({
  //       ...userTokenDetails,
  //       claimedAmount: claimedTokens,
  //       remainingAmount: remainingTokens,
  //       vestingProgress
  //     });
  //   }
  // }, [userTokenDetails.totalAllocation, userTokenDetails.claimableAmount, userTokenDetails.vestedAmount]);

  return <ClaimTokensContext.Provider value={value}>{children}</ClaimTokensContext.Provider>;
}

export const useClaimTokensContext = () => ({
  ...useContext(ClaimTokensContext)
});
