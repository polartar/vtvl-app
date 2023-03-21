import ERC20 from '@contracts/abi/ERC20.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import format from 'date-fns/format';
import getUnixTime from 'date-fns/getUnixTime';
import sub from 'date-fns/sub';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { fetchVestingContractByQuery, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { spaceMissions } from 'types/constants/shared';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting } from 'types/models';
import { TUserTokenDetails } from 'types/models/token';

import { formatNumber } from './token';
import { getCliffAmountDecimal, getCliffDateTime, getNumberOfReleases, getReleaseAmountDecimal } from './vesting';

/**
 * Converts a single label item into an option with a label and value -- to be used on select inputs
 * values are converted into lower camel case
 */
export const convertLabelToOption = (label: string) => ({
  label,
  value: label
    .toLocaleLowerCase()
    .split(' ')
    .map((word, wIndex) => {
      return wIndex && word ? word[0].toUpperCase() + word.substring(1) : word;
    })
    .join('')
});

/**
 * Converts a list of items into options for the select input
 */
export const convertAllToOptions = (data: string[]) => data.map((item) => convertLabelToOption(item));

/**
 * Converts the date into a human readable one
 */
export const formatDate = (date: Date) => format(date, 'E, LLL d, yyyy');

/**
 * Converts the time into a human readable one
 */
export const formatTime = (date: Date) => format(date, 'h:mm a (O)');
export const formatDateTime = (date: Date) => format(date, 'E, LLL d, yyyy h:mm a (O)');

/**
 * Visually compress the token address
 */
export const minifyAddress = (address: string) =>
  `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;

/**
 * Conversion to currency -- currently used as sample might update this later
 */
export const convertToUSD = (amount: number | Decimal | string) => {
  console.log('CONVERT TO USD', typeof amount);
  return formatNumber(typeof amount === 'number' || typeof amount === 'string' ? +amount * 0.0001 : amount.mul(0.0001));
};

// This function lets us parse the correct date format before displaying and using it across the schedule form and chart.
export interface IActualDateTimeProps {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  originalEndDateTime: Date | null | undefined;
}
export const getActualDateTime = (data: IActualDateTimeProps) => {
  let startDateTime;
  let endDateTime;
  let originalEndDateTime;
  try {
    // Try first with the presumption that the dates provided are in Timestamp -- came from firebase.
    startDateTime = new Date((data.startDateTime as unknown as Timestamp).toMillis());
    endDateTime = new Date((data.endDateTime as unknown as Timestamp).toMillis());
    originalEndDateTime = new Date(
      ((data.originalEndDateTime ? data.originalEndDateTime : data.endDateTime) as unknown as Timestamp).toMillis()
    );
  } catch (err) {
    // Catch it with the default as if it came from current form data
    startDateTime = data.startDateTime;
    endDateTime = data.endDateTime;
    originalEndDateTime = data.originalEndDateTime || data.endDateTime;
  }
  return {
    startDateTime,
    endDateTime,
    originalEndDateTime
  };
};

// Generates a set of numbers based on the given length
export const generateRandomName = (l = 4) => {
  const length = l;
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  const spaceMission = spaceMissions[Math.floor(Math.random() * spaceMissions.length)];
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${spaceMission}-${result}`;
};

/**
 * This function is used to get all the token details needed for a specific user.
 * Requirements for the claimed, unclaimed etc.
 * @param selectedSchedule
 * @param userWalletAddress
 * @param chainId
 * @returns the data of the user's token
 */
export const getUserTokenDetails = async (
  selectedSchedule: { id: string; data: IVesting },
  userWalletAddress: string,
  chainId: number,
  timeStamp?: Date
) => {
  // All details for the specific user
  const userTokenDetails: TUserTokenDetails = {
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
  };
  // Start getting datas when the selected schedule is present
  if (selectedSchedule && selectedSchedule.data) {
    // Compute datas that are currently not available
    const { cliffDuration, lumpSumReleaseAfterCliff, amountToBeVested, startDateTime, endDateTime, releaseFrequency } =
      selectedSchedule.data.details;
    // Get the cliff date so we can proceed
    const cliffDate = startDateTime ? getCliffDateTime(startDateTime, cliffDuration) : '';
    // Get the cliff amount
    const cliffAmount = getCliffAmountDecimal(
      cliffDuration,
      new Decimal(lumpSumReleaseAfterCliff),
      new Decimal(amountToBeVested)
    );
    // Get the number of releases this schedule will take
    const numberOfReleases =
      startDateTime && endDateTime ? getNumberOfReleases(releaseFrequency, cliffDate || startDateTime, endDateTime) : 0;
    // Get the amount for each release on this schedule
    const releaseAmount = getReleaseAmountDecimal(new Decimal(amountToBeVested), cliffAmount, numberOfReleases);

    // Update the current user token details based on the initially gathered data
    userTokenDetails.cliffAmount = cliffAmount;
    userTokenDetails.releaseAmount = releaseAmount;
    userTokenDetails.cliffDate = cliffDate;
    userTokenDetails.numberOfReleases = numberOfReleases;

    // Check for the vesting contract so we can query it in the blockchain
    const contractsFromDB = await fetchVestingContractsByQuery(
      ['organizationId', 'chainId'],
      ['==', '=='],
      [selectedSchedule?.data.organizationId, chainId]
    );

    const v = contractsFromDB.find((v) => v.id === selectedSchedule.data.vestingContractId);

    // We can now query via ethers
    if (v) {
      // Update user token details for the contract address
      userTokenDetails.vestingContractAddress = v.data.address;
      console.log('Contract address', v.data);
      // Query the blockchain for the data we need
      const vestingContract = await new ethers.Contract(
        v?.data?.address ?? '',
        VTVL_VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );

      // Get the token details in the blockchain
      const tokenDetails = await new ethers.Contract(
        v?.data?.tokenAddress,
        ERC20,
        ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
      );

      // Added a 10 second difference to ensure 0 claimed data points
      // when the frequency is continuous -- per second -- and if recipient is not claiming yet
      const getRecipientClaimTimeStamp =
        selectedSchedule.data.details.releaseFrequency === 'continuous'
          ? sub(timeStamp || new Date(), { seconds: 10 })
          : new Date();

      // Simultaneously query below datas in preparation for computations
      const [totalAllocatedToUser, totalClaimableByUser, totalVestedToUser, tokenName, tokenSymbol] = await Promise.all(
        [
          vestingContract.finalVestedAmount(userWalletAddress),
          vestingContract.claimableAmount(userWalletAddress),
          vestingContract.vestedAmount(userWalletAddress, getUnixTime(getRecipientClaimTimeStamp)),
          tokenDetails.name(),
          tokenDetails.symbol()
        ]
      );

      if (totalAllocatedToUser && totalClaimableByUser && totalVestedToUser && tokenName && tokenSymbol) {
        // gets the total allocation of an individual user
        const totalAllocation = new Decimal(+totalAllocatedToUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);
        // gets the currently claimable token of the individual user
        const claimableAmount = new Decimal(+totalClaimableByUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);
        // gets the total vested amount that the individual user holds
        // claimed and unclaimed
        const vestedAmount = new Decimal(+totalVestedToUser.toString() / 1e18).toDP(6, Decimal.ROUND_UP);

        // Update the user token details based on the gathered data from blockchain
        userTokenDetails.totalAllocation = totalAllocation;
        userTokenDetails.claimableAmount = claimableAmount;
        userTokenDetails.vestedAmount = vestedAmount;
        userTokenDetails.name = tokenName;
        userTokenDetails.symbol = tokenSymbol;
        userTokenDetails.lockedTokens = totalAllocation.minus(vestedAmount);

        // Compute amounts based on the results above
        if (totalAllocation || claimableAmount || vestedAmount) {
          const claimedTokens = vestedAmount.greaterThanOrEqualTo(claimableAmount)
            ? vestedAmount.minus(claimableAmount)
            : new Decimal(0);
          const remainingTokens = totalAllocation.minus(vestedAmount.minus(claimedTokens));
          const vestingProgress = +vestedAmount.div(totalAllocation) * 100;
          // Update the user token details based on computed values
          userTokenDetails.claimedAmount = claimedTokens;
          userTokenDetails.remainingAmount = remainingTokens;
          userTokenDetails.vestingProgress = vestingProgress;
        }
      }
    }
  }

  console.log('userTokenDetails ' + userWalletAddress, userTokenDetails);
  return userTokenDetails;
};

// This function lets the user scroll into view on the element's position
export const scrollIntoView = (element: any) => {
  window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
};

/**
 * Remove duplicated item in string or number array data
 *
 * @example
 * Input => [2, 3, 4, 3, 6, 2]
 * Output => [2, 3, 4, 6]
 */
export const removeDuplication = <T extends string>(data: Array<T> = []) => {
  return Object.keys(data.reduce((res, item) => ({ ...res, [item]: true }), {}));
};
