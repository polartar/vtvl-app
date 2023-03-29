import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import VestingProgress from '@components/atoms/VestingProgress/VestingProgress';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useClaimTokensContext } from '@providers/claim-tokens.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import getUnixTime from 'date-fns/getUnixTime';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import CalendarClockIcon from 'public/icons/calendar-clock.svg';
import LockIcon from 'public/icons/lock.svg';
import UnlockIcon from 'public/icons/unlock.svg';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Countdown from 'react-countdown';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchVesting } from 'services/db/vesting';
import { formatDate, formatTime, getActualDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { getChartData, getCliffAmount, getCliffDateTime, getNextUnlock, getReleaseFrequencyLabel } from 'utils/vesting';

const MyTokenSchedule: NextPageWithLayout = () => {
  const { library, chainId, account, activate } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { userTokenDetails, vestingSchedules, selectedSchedule, selectedToken, setSelectedSchedule, fetchContract } =
    useClaimTokensContext();
  const router = useRouter();
  // schedule = document id of the vesting schedule
  const { schedule } = router.query;
  // Stores the current next unlock date time and convert it to countdown
  const [nextUnlock, setNextUnlock] = useState(1000);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isNextUnlockUpdated, setIsNextUnlockUpdated] = useState(true);
  const [isCliffComplete, setIsCliffComplete] = useState(false);
  const [projectionData, setProjectionData] = useState<any>({
    release: [{ date: '', value: '' }],
    cliff: [{ date: '', value: '' }],
    projectedEndDateTime: new Date()
  });
  const countDownComponent = useRef<Countdown>(null);

  const [chartData, setChartData] = useState([
    { name: 'Withdrawn', value: 0 },
    { name: 'Unclaimed', value: 0 },
    { name: 'Remaining', value: 0 }
  ]);

  // When the countdown of the next unlock ends,
  // we will requery the next unlock time and update the claimable tokens
  const handleCountdownComplete = (data: any) => {
    console.log('Countdown end', data);
    // Just to the refetch contract
    fetchContract();
  };

  // When the claim button is clicked
  const handleClaim = async () => {
    setIsClaiming(true);
    if (!account || !library || !chainId) {
      activate(injected);
      setIsClaiming(false);
      return;
    }
    setIsCloseAvailable(false);
    if (userTokenDetails.vestingContractAddress) {
      const vestingContract = new ethers.Contract(
        userTokenDetails.vestingContractAddress,
        VTVL_VESTING_ABI.abi,
        library.getSigner()
      );
      setTransactionStatus('PENDING');
      try {
        const withdrawTx = await vestingContract.withdraw();
        setTransactionStatus('IN_PROGRESS');
        await withdrawTx.wait();
        setTransactionStatus('SUCCESS');
        // Do the claimable computations again by fetching the contract in the claim tokens context
        fetchContract();
        setIsClaiming(false);
      } catch (err) {
        console.log('handleClaim - ', err);
        setTransactionStatus('ERROR');
        setIsClaiming(false);
      }
    } else {
      setIsClaiming(false);
    }
  };

  // Handles the importing for token to wallet process
  const importToken = async () => {
    try {
      if (!library || !selectedToken) return;
      await library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: selectedToken?.address,
            symbol: selectedToken?.symbol,
            decimals: selectedToken?.decimals || 18,
            image: selectedToken?.logo
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch for the actual vesting schedule OR get that from the vestings collection via tokens context
  const getVestingScheduleDetails = async () => {
    console.log('fetching schedule', schedule);
    // Get the schedule details
    try {
      const getVestingSchedule = await fetchVesting(schedule as string);
      console.log('Vesting Schedule UI', getVestingSchedule);
      if (getVestingSchedule) {
        const actualDateTime = getActualDateTime(getVestingSchedule.details);
        setSelectedSchedule({
          ...getVestingSchedule,
          details: {
            ...getVestingSchedule?.details,
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime,
            originalEndDateTime: actualDateTime.originalEndDateTime
          }
        });
      }
    } catch (err) {
      // something went wrong
    }
  };

  // Get the vesting schedule details if came from a refresh or direct link
  useEffect(() => {
    if (schedule && !vestingSchedules.length) {
      getVestingScheduleDetails();
    }
  }, [schedule, vestingSchedules]);

  // Watch for the claimed, unclaimed and remaining tokens
  useEffect(() => {
    setChartData([
      ...chartData.map((data) => {
        let newValue = 0;
        switch (data.name) {
          case 'Claimed':
          case 'Withdrawn':
            newValue = parseFloat(userTokenDetails.claimedAmount.toString());
            break;
          case 'Unclaimed':
          case 'Amount vested to-date':
            newValue = parseFloat(userTokenDetails.claimableAmount.toString());
            break;
          case 'Remaining':
            newValue = parseFloat(userTokenDetails.remainingAmount.toString());
            break;
          default:
            break;
        }
        return {
          ...data,
          value: newValue
        };
      })
    ]);

    // Get the next unlock -- only on non-continuous
    if (selectedSchedule && selectedSchedule.data) {
      const { startDateTime, endDateTime, releaseFrequency, cliffDuration } = selectedSchedule.data.details;
      if (startDateTime && endDateTime && releaseFrequency && cliffDuration) {
        const computeCliffDateTime = getCliffDateTime(startDateTime, cliffDuration);
        // Next unlock is 60 seconds for continuous frequency schedules
        const computeNextUnlock =
          selectedSchedule.data.details.releaseFrequency !== 'continuous'
            ? getNextUnlock(endDateTime, releaseFrequency, computeCliffDateTime)
            : 60;
        console.log('NEXT UNLOCK', computeCliffDateTime, computeNextUnlock);
        // Milliseconds
        setNextUnlock(computeNextUnlock * 1000);
        if (countDownComponent && countDownComponent.current) {
          // Start the countdown when the claimables have been updated
          countDownComponent.current.start();
        }
      }
    }
    // Update animation
    setIsNextUnlockUpdated(true);
    hideLoading();
  }, [userTokenDetails.claimedAmount, userTokenDetails.remainingAmount]);

  // Listen to the isNextUnlockUpdated and auto remove after 1-2 seconds of appearance
  useEffect(() => {
    if (isNextUnlockUpdated) {
      setTimeout(() => setIsNextUnlockUpdated(false), 2000);
    }
  }, [isNextUnlockUpdated]);

  useEffect(() => {
    // Initially
    showLoading();
    if (selectedSchedule && selectedSchedule.data) {
      const {
        cliffDuration,
        lumpSumReleaseAfterCliff,
        amountToBeVested,
        startDateTime,
        endDateTime,
        releaseFrequency
      } = selectedSchedule.data.details;
      const cliffAmount = getCliffAmount(cliffDuration, +lumpSumReleaseAfterCliff, +amountToBeVested);
      const projectionChartData = getChartData({
        start: startDateTime || new Date(),
        end: endDateTime || new Date(),
        cliffDuration,
        cliffAmount,
        frequency: releaseFrequency,
        vestedAmount: +amountToBeVested
      });
      setProjectionData(projectionChartData);
    }
  }, [selectedSchedule]);

  useEffect(() => {
    if (userTokenDetails.cliffDate) {
      const cliffDateSeconds = getUnixTime(userTokenDetails.cliffDate as Date);
      const nowSeconds = getUnixTime(new Date());
      if (nowSeconds >= cliffDateSeconds) {
        // Cliff complete
        setIsCliffComplete(true);
      }
    }
  }, [userTokenDetails.cliffDate]);

  return (
    <>
      {selectedSchedule && selectedSchedule.data && userTokenDetails ? (
        <div className="w-full">
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <h1 className="text-neutral-900 mb-2">{selectedSchedule?.data.name}</h1>
              <p className="paragraphy-small text-neutral-500 mb-4">
                Withdraw your <strong>{userTokenDetails.symbol || 'Token'}</strong> tokens from this vesting schedule.
              </p>
              <div className="panel">
                <ResponsiveContainer width={'99%'} height={300}>
                  <PieChart width={400} height={400}>
                    <text
                      x={'50%'}
                      y={'43%'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-neutral-500">
                      Your total allocation
                    </text>
                    <text
                      x={'50%'}
                      y={'51%'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="paragraphy-medium-medium fill-neutral-900">
                      {formatNumber(userTokenDetails.totalAllocation)} {userTokenDetails.symbol || 'Token'}
                    </text>
                    <text
                      x={'50%'}
                      y={'57%'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-success-500">
                      = ${formatNumber(5198.58, 2)}
                    </text>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={115}
                      outerRadius={140}
                      fill="#82ca9d">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === 'Claimed' || entry.name === 'Withdrawn'
                              ? 'var(--secondary-900)'
                              : entry.name === 'Unclaimed' || entry.name === 'Amount vested to-date'
                              ? 'var(--primary-900)'
                              : 'var(--success-500)'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => formatNumber(parseFloat(value.toString()), 6)} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-lg text-neutral-900 my-6">Your schedule summary</p>
                <ScheduleDetails
                  {...selectedSchedule.data.details}
                  token={userTokenDetails.symbol || 'Token'}
                  includeDetails={false}
                />
                <div className="mt-9">
                  {selectedSchedule?.data.details && selectedSchedule.data.details.endDateTime ? (
                    <VestingProgress
                      duration={`${formatDistanceToNow(selectedSchedule.data.details.endDateTime)} left`}
                      progress={userTokenDetails.vestingProgress}
                    />
                  ) : null}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6 border-b border-gray-200 pb-6">
                  <div className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
                    <p className="paragraphy-small-medium text-neutral-500 mb-2">Withdrawn</p>
                    <div className="paragraphy-small-semibold text-neutral-600 flex flex-row gap-1">
                      <div className="mt-1 w-3 h-3 rounded-full bg-secondary-900 flex-shrink-0"></div>
                      <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                        {formatNumber(userTokenDetails.claimedAmount, 6)} {userTokenDetails.symbol || 'Token'}
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 pb-3 lg:border-0 lg:pb-0">
                    <p className="paragraphy-small-medium text-neutral-500 mb-2">Unclaimed</p>
                    <div className="paragraphy-small-semibold text-neutral-600 flex flex-row gap-1">
                      <div className="mt-1 w-3 h-3 rounded-full bg-primary-900 flex-shrink-0"></div>
                      <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                        {formatNumber(userTokenDetails.claimableAmount, 6)} {userTokenDetails.symbol || 'Token'}
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 pb-3 sm:border-0 sm:pb-0">
                    <p className="paragraphy-small-medium text-neutral-500 mb-2">Remaining</p>
                    <div className="paragraphy-small-semibold text-neutral-600 flex flex-row gap-1">
                      <div className="mt-1 w-3 h-3 rounded-full bg-success-500 flex-shrink-0"></div>
                      <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                        {formatNumber(userTokenDetails.remainingAmount, 6)} {userTokenDetails.symbol || 'Token'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="paragraphy-small-medium text-neutral-500 mb-2">Next unlock</p>
                    <div className="paragraphy-small-semibold text-neutral-600">
                      {/*
                      Add the current date here plus the end date time of the vesting schedule 
                      OR probably be the date time of the next linear release
                      all in milliseconds
                    */}
                      <Countdown
                        ref={countDownComponent}
                        autoStart={false}
                        date={Date.now() + nextUnlock}
                        renderer={({ days, hours, minutes, seconds }) => (
                          <>
                            {days}d {hours}h {minutes}m {seconds}s
                          </>
                        )}
                        onComplete={handleCountdownComplete}
                      />
                      {selectedSchedule.data.details.releaseFrequency === 'continuous' ? (
                        <div className="leading-4 font-normal text-xs text-neutral-500">
                          Whilst tokens are streamed per second, the claimable amount will only get updated every
                          minute.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  className="primary w-full"
                  loading={isClaiming}
                  disabled={!userTokenDetails.claimableAmount || !account || !chainId || !library}
                  onClick={handleClaim}>
                  <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                    Claim <strong>{formatNumber(userTokenDetails.claimableAmount, 6)}</strong>{' '}
                    {userTokenDetails.symbol || 'Token'}
                  </span>
                </Button>
              </div>
            </div>
            <div className="md:col-span-5">
              <h2 className="h1 text-neutral-900 mb-2">Token summary</h2>
              <p className="paragraphy-small text-neutral-500 mb-4">
                Here is the summary of your <strong>{userTokenDetails.symbol}</strong> tokens.
              </p>
              <div className="panel p-0 grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <div className="p-6 flex flex-row items-center gap-6 border-b border-gray-200 sm:col-span-2 md:col-span-1 lg:col-span-2">
                  <div className="text-center">
                    <img
                      src={selectedToken?.logo ?? mintFormState.logo}
                      className="w-12 h-12 rounded-full overflow-hidden mx-auto"
                    />
                    <p className="font-bold text-neutral-900">{mintFormState.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Total granted</p>
                    <p className="text-2xl text-neutral-900">
                      {formatNumber(userTokenDetails.totalAllocation, 6)} <strong>{userTokenDetails.symbol}</strong>
                    </p>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <LockIcon className="h-6 fill-current" />
                    <span className="text-sm text-neutral-500">Locked</span>
                  </div>
                  <div className="text-lg text-neutral-900">
                    <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                      {formatNumber(userTokenDetails.remainingAmount, 6)} <strong>{userTokenDetails.symbol}</strong>
                    </span>
                  </div>
                </div>
                <div className="p-6 border-b lg:border-l border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <UnlockIcon className="h-6 fill-current" />
                    <span className="text-sm text-neutral-500">Unlocked</span>
                  </div>
                  <div className="text-lg text-neutral-900">
                    <span className={`${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                      {formatNumber(userTokenDetails.vestedAmount, 6)} <strong>{userTokenDetails.symbol}</strong>
                    </span>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <CalendarClockIcon className="h-6 fill-current" />
                    <span className="text-sm text-neutral-500">Unlock Start</span>
                  </div>
                  <div className="text-neutral-900">
                    {selectedSchedule.data.details.startDateTime ? (
                      <>
                        {formatDate(selectedSchedule.data.details.startDateTime)}
                        <br />
                        {formatTime(selectedSchedule.data.details.startDateTime)}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="p-6 border-b lg:border-l border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <CalendarClockIcon className="h-6 fill-current" />
                    <span className="text-sm text-neutral-500">Unlock End</span>
                  </div>
                  <div className="text-neutral-900">
                    {projectionData && projectionData.projectedEndDateTime ? (
                      <>
                        {formatDate(projectionData.projectedEndDateTime)}
                        <br />
                        {formatTime(projectionData.projectedEndDateTime)}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="p-6 border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <LockIcon className="h-6 fill-current" />
                    <span className={`text-sm text-neutral-500${isNextUnlockUpdated ? 'animate-pulse' : ''}`}>
                      Cliff
                    </span>
                    {isCliffComplete && selectedSchedule.data.details.cliffDuration !== 'no-cliff' ? (
                      <Chip label="Finished" rounded color="successAlt" size="small" />
                    ) : null}
                  </div>
                  <div className="text-lg text-neutral-900">
                    <span className="capitalize">{selectedSchedule.data.details.cliffDuration.replace('-', ' ')}</span>
                    {selectedSchedule.data.details.cliffDuration !== 'no-cliff' ? (
                      <>
                        /{formatNumber(userTokenDetails.cliffAmount, 6)} <strong>{userTokenDetails.symbol}</strong>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
                  <div className="flex flex-row items-center gap-2 mb-2.5">
                    <UnlockIcon className="h-6 fill-current" />
                    <span className="text-sm text-neutral-500">Linear Release</span>
                  </div>
                  <div className="text-lg text-neutral-900">
                    {formatNumber(userTokenDetails.releaseAmount, 6)}/
                    {getReleaseFrequencyLabel(selectedSchedule.data.details.releaseFrequency)}
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 text-center  sm:col-span-2 md:col-span-1 lg:col-span-2">
                  <p className="text-gray-500">Let's start claiming your tokens.</p>
                  <button onClick={() => importToken()} className="secondary py-1">
                    Import token to your wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
MyTokenSchedule.getLayout = function getLayout(page: ReactElement) {
  const { mintFormState } = useTokenContext();
  const { selectedSchedule } = useClaimTokensContext();
  const router = useRouter();
  // schedule = document id of the vesting schedule
  const { schedule } = router.query;
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'My tokens', route: '/tokens' },
    // Update the title of this into the actual token name
    { title: mintFormState?.name || 'Token', route: `/tokens/${schedule}` },
    // Update the title of this into the actual schedule name
    { title: selectedSchedule?.data.name || 'Schedule', route: `/tokens/${schedule}` }
  ];
  useEffect(() => {
    console.log('LAYOUT changes', selectedSchedule);
  }, [selectedSchedule]);
  return (
    <SteppedLayout title="" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default MyTokenSchedule;
