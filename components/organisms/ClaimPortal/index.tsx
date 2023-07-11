import EmptyState from '@components/atoms/EmptyState/EmptyState';
import { VestingCalendarIcon, VestingScheduleIcon } from '@components/atoms/Icons';
import MediaAsset from '@components/atoms/MediaAsset/MediaAsset';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useOrganizationsFromIds } from '@store/useOrganizations';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { ethers } from 'ethers';
import { useChainVestings } from 'hooks/useChainVestings';
import { useMyRecipes } from 'hooks/useRecipients';
import { useShallowState } from 'hooks/useShallowState';
import { useTokensFromIds } from 'hooks/useTokens';
import { useVestingContractsFromIds } from 'hooks/useVestingContracts';
import { useVestingsFromIds } from 'hooks/useVestings';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo } from 'react';
import { compareAddresses } from 'utils';
import { formatDate, getActualDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { getCliffDateTime, getNextUnlock } from 'utils/vesting';

import AllocationSummaryChart from '../Cards/AllocationSummaryChart';
import StandardCard from '../Cards/StandardCard';
import VestingCard from '../Cards/VestingCard';
import ProjectTabs, { ProjectOption } from '../Tabs/ProjectTabs';

const formatDateTime = (dateTime: any) => {
  return formatDate(new Date(dateTime.toMillis()));
};

export default function ClaimPortal() {
  const { library } = useWeb3React();
  const { isLoadingMyRecipes, myRecipes, myVestingIds, myOrganizationIds, schedulesByOrganization } = useMyRecipes();
  const { isLoadingOrganizations, organizations } = useOrganizationsFromIds(myOrganizationIds);
  const { vestings, vestingTokenIds, vestingContractIds } = useVestingsFromIds(myVestingIds);
  const { tokens } = useTokensFromIds(vestingTokenIds);
  const { vestingContracts, vestingContractAddresses } = useVestingContractsFromIds(vestingContractIds);
  const {
    isLoadingVestings: isLoadingChainVesting,
    vestings: vestingInfos,
    refetchVestings: refetchChainVestings
  } = useChainVestings(vestingContracts);
  const { setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();

  const [selectedProject, setSelectedProject] = useShallowState<ProjectOption>();

  const hasVestings = !!myRecipes?.length;
  const hasContracts = !!vestingContractAddresses?.length;

  const isLoading = isLoadingMyRecipes || (isLoadingChainVesting && hasVestings && hasContracts);

  const {
    website: { assets }
  } = useGlobalContext();

  /**
   * Project Tabs data
   */
  const projects = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.data.name,
        value: org.id
      })),
    [organizations]
  );

  /**
   * Sum of total allocations from current(selected) organization
   */
  const totalAllocations = useMemo(() => {
    return myRecipes?.reduce((val, { data: recipe }) => val + Number(recipe?.allocations), 0) ?? 0;
  }, [myRecipes]);

  const vestingDetails = useMemo(
    () =>
      vestingInfos.map((vestingInfo) => {
        const contract = vestingContracts.find((c) => compareAddresses(c.data.address, vestingInfo.address));
        const singleVesting = vestings.find((v) => v.data.vestingContractId === contract?.id);
        return {
          id: contract?.id,
          vestingId: singleVesting?.id,
          tokenId: singleVesting?.data.tokenId,
          organizationId: singleVesting?.data.organizationId,
          ...vestingInfo
        };
      }),
    [vestingInfos, vestingContracts, vestings]
  );

  const vestingDetail = useMemo(() => {
    const vestingData = vestingDetails.filter((vd) => vd.organizationId === selectedProject.value);

    return vestingData.reduce(
      (val, vesting) => {
        return {
          allocations: val.allocations + Number(vesting.allocations),
          locked: val.locked + Number(vesting.locked),
          withdrawn: val.withdrawn + Number(vesting.withdrawn),
          unclaimed: val.unclaimed + Number(vesting.unclaimed)
        };
      },
      { allocations: 0, locked: 0, withdrawn: 0, unclaimed: 0 }
    );
  }, [vestingDetails, selectedProject]);

  /**
   * Current organization's governance token
   */
  const token = useMemo(
    () => tokens?.find((token) => token.data.organizationId === selectedProject?.value),
    [selectedProject?.value, tokens]
  );

  /**
   * Loading page
   */
  const isLoadingDetails = useMemo(() => !token || !vestingDetail, [token, vestingDetail]);

  const getTokenSymbol = useCallback(
    (tokenId: string) => {
      return tokens.find((token) => token.id === tokenId)?.data.symbol;
    },
    [tokens]
  );

  /**
   * Get vesting info data by contract address
   */
  const getVestingInfoByContract = useCallback(
    (contract: string) => vestingInfos.find((vi) => compareAddresses(vi.address, contract)),
    [vestingInfos]
  );

  /**
   * When project tab is clicked
   */
  const handleSelectProject = useCallback((project: ProjectOption) => {
    setSelectedProject(project);
  }, []);

  /**
   * Claim Vesting
   */
  const handleClaim = useCallback(
    async (vestingInfo: {
      address: string;
      allocations: string;
      locked: string;
      withdrawn: string;
      unclaimed: string;
    }) => {
      if (Number(vestingInfo.unclaimed) > 0) {
        // withdraw
        try {
          const vestingContract = new ethers.Contract(vestingInfo.address, VTVL_VESTING_ABI.abi, library.getSigner());
          setIsCloseAvailable(false);
          setTransactionStatus('PENDING');

          const withdrawTx = await vestingContract.withdraw();
          setTransactionStatus('IN_PROGRESS');
          await withdrawTx.wait();

          refetchChainVestings();

          // Update ChainVestings data
          // onUpdateChainVestings(
          //   vestingInfo.address,
          //   ['unclaimed', 'withdrawn'],
          //   ['0', String(Number(vestingInfo.withdrawn) + Number(vestingInfo.unclaimed))]
          // );

          setTransactionStatus('SUCCESS');
        } catch (err) {
          console.log('handleClaim - ', err);
          setTransactionStatus('ERROR');
        }
      }
    },
    [library]
  );

  useEffect(() => {
    setSelectedProject(projects?.[0]);
  }, [projects]);

  return !isLoadingMyRecipes && !hasVestings ? (
    <EmptyState
      image={
        <MediaAsset
          src={assets?.emptyState?.src || '/images/cryptocurrency-trading-bot.gif'}
          animated={assets?.emptyState?.animated || false}
          active={true}
          fallback="/images/cryptocurrency-trading-bot.gif"
          className="h-80"
        />
      }
      title="No claimable tokens"
      description={<>Come back again next time.</>}
    />
  ) : (
    <div className="w-full">
      <Typography size="title" className="font-semibold text-neutral-900 mb-5">
        My Tokens
      </Typography>
      {!isLoadingMyRecipes && !hasVestings ? (
        <EmptyState
          image="/images/cryptocurrency-trading-bot.gif"
          title="No claimable tokens"
          description={<>Come back again next time.</>}
        />
      ) : (
        <div className="w-full px-4">
          <div className="mb-6 flex gap-6">
            <div className="w-323 h-323 relative mx-auto hidden lg:flex scale-105">
              <AllocationSummaryChart
                width={323}
                height={323}
                colors={['#00e396', '#008ffb', '#f9e597']}
                data={[
                  {
                    name: 'Withdraw Amount',
                    value: vestingDetail.withdrawn
                  },
                  {
                    name: 'Unclaimed Amount',
                    value: vestingDetail.unclaimed
                  },
                  {
                    name: 'Total Locked Amount',
                    value: vestingDetail.locked
                  }
                ]}
              />
              <div className="w-full flex flex-col gap-2 items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Typography size="caption" className="font-medium text-neutral-500">
                  Your total allocation
                </Typography>
                {token && vestingDetail ? (
                  <Typography size="subtitle" className="font-semibold">
                    {formatNumber(totalAllocations)} {token.data.symbol}
                  </Typography>
                ) : (
                  <div className="animate-pulse">
                    <div className="w-[100px] h-[40px] bg-neutral-100 rounded-10"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <div className="mb-6">
                {isLoadingOrganizations || !selectedProject ? (
                  <div className="animate-pulse">
                    <div className="w-[200px] h-[40px] bg-neutral-100 rounded-10"></div>
                  </div>
                ) : (
                  <ProjectTabs
                    title="Projects"
                    projects={projects}
                    initialSelectedProject={selectedProject}
                    onSelectProject={handleSelectProject}
                  />
                )}
              </div>
              <div className="grid sm:grid-cols-12 gap-6">
                <StandardCard
                  isLoading={isLoadingDetails}
                  icon={<VestingScheduleIcon className="w-6 h-6" />}
                  title="Token Name"
                  content={String(token?.data.name)}
                  contentType="text"
                  contentIcon={
                    <div className="h-8 w-8 p-1.5 rounded-full bg-neutral-200 text-neutral-500 flex flex-shrink-0 items-center justify-center font-bold">
                      {token?.data.logo ? (
                        <Image
                          src={String(token?.data.logo)}
                          alt={`${token?.data.name} Token`}
                          width={19}
                          height={19}
                        />
                      ) : (
                        token?.data.name.charAt(0)
                      )}
                    </div>
                  }
                  className="sm:col-span-12 lg:col-span-6 xl:col-span-4"
                />
                <StandardCard
                  isLoading={isLoadingDetails || !vestingDetail}
                  icon={<VestingScheduleIcon className="w-6 h-6" />}
                  title="Total granted"
                  content={String(formatNumber(totalAllocations))}
                  contentType="number"
                  className="sm:col-span-6 xl:col-span-4"
                />
                <StandardCard
                  isLoading={isLoadingDetails}
                  icon={<VestingCalendarIcon className="w-6 h-6" />}
                  title="Schedule"
                  content={String(Number(schedulesByOrganization?.[selectedProject.value] ?? 0))}
                  contentType="text"
                  className="sm:col-span-6 xl:col-span-4"
                />
                <StandardCard
                  isLoading={isLoadingDetails}
                  icon={<span className="w-2.5 h-2.5 rounded-full bg-[#00e396]" />}
                  title="Withdrawn"
                  content={Number(vestingDetail.withdrawn).toFixed(2)}
                  contentType="number"
                  className="sm:col-span-6 md:col-span-4 lg:col-span-6 xl:col-span-4"
                />
                <StandardCard
                  isLoading={isLoadingDetails}
                  icon={<span className="w-2.5 h-2.5 rounded-full bg-[#008ffb]" />}
                  title="Unclaimed"
                  content={Number(vestingDetail.unclaimed).toFixed(2)}
                  contentType="number"
                  className="sm:col-span-6 md:col-span-4 lg:col-span-6 xl:col-span-4"
                />
                <StandardCard
                  isLoading={isLoadingDetails}
                  icon={<span className="w-2.5 h-2.5 rounded-full bg-[#f9e597]" />}
                  title="Total locked"
                  content={Number(vestingDetail.locked).toFixed(2)}
                  contentType="number"
                  className="sm:col-span-12 md:col-span-4 lg:col-span-6 xl:col-span-4"
                />
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from(new Array(3)).map((_, index) => (
                  <div key={index} className="animate-pulse w-full">
                    <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
                  </div>
                ))
              : vestings.map((singleVesting) => {
                  const contract = vestingContracts.find((c) => c.id === singleVesting.data.vestingContractId);
                  const vestingInfo = getVestingInfoByContract(String(contract?.data.address));
                  const { startDateTime, endDateTime, releaseFrequency, cliffDuration } = singleVesting.data.details;
                  const computeCliffDateTime = getCliffDateTime(startDateTime!, cliffDuration);

                  const actualDates = getActualDateTime(singleVesting.data.details);
                  let progress = 0;
                  if (actualDates.startDateTime && actualDates.endDateTime && singleVesting.data.status === 'LIVE') {
                    const totalSeconds = differenceInSeconds(actualDates.endDateTime, actualDates.startDateTime);
                    const secondsFromNow = differenceInSeconds(new Date(), actualDates.startDateTime);
                    progress = Math.round((Number(secondsFromNow) / Number(totalSeconds)) * 100);
                  }
                  progress = progress >= 100 ? 100 : progress;

                  const unlockDate =
                    singleVesting.data.status === 'LIVE'
                      ? Date.now() +
                        (singleVesting.data.details.releaseFrequency !== 'continuous' && endDateTime
                          ? getNextUnlock(endDateTime, releaseFrequency, computeCliffDateTime)
                          : 60) *
                          1000
                      : 0;

                  return (
                    <VestingCard
                      key={singleVesting.id}
                      title={String(singleVesting.data.name)}
                      startDate={formatDateTime(startDateTime)}
                      endDate={formatDateTime(endDateTime)}
                      unlockDate={unlockDate}
                      withdrawnAmount={Number(String(vestingInfo?.withdrawn)).toFixed(2)}
                      unclaimedAmount={Number(String(vestingInfo?.unclaimed)).toFixed(2)}
                      totalLockedAmount={Number(String(vestingInfo?.locked)).toFixed(2)}
                      buttonLabel={`CLAIM ${Number(String(vestingInfo?.unclaimed ?? 0)).toFixed(2)} ${getTokenSymbol(
                        String(singleVesting.data.tokenId)
                      )}`}
                      buttonAction={() => vestingInfo && handleClaim(vestingInfo)}
                      percentage={progress}
                      disabled={!vestingInfo}
                    />
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}
