import { VestingCalendarIcon, VestingScheduleIcon } from '@components/atoms/Icons';
import { Typography } from '@components/atoms/Typography/Typography';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { ethers } from 'ethers';
import useChainVestings from 'hooks/useChainVestings';
import useOrganizations from 'hooks/useOrganizations';
import { useShallowState } from 'hooks/useShallowState';
import useTokens from 'hooks/useTokens';
import useVestingContracts from 'hooks/useVestingContracts';
import useVestings from 'hooks/useVestings';
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
  const {
    isLoading: isLoadingVestings,
    organizationIds,
    vestings,
    tokenIds,
    recipes,
    vestingContractIds
  } = useVestings();
  const { isLoading: isLoadingOrganizations, organizations } = useOrganizations(organizationIds);
  const { tokens } = useTokens(tokenIds);
  const { library } = useWeb3React();
  const { contracts, vestingContracts } = useVestingContracts(vestingContractIds);
  const {
    isLoading: isLoadingChainVesting,
    vestings: vestingInfos,
    onUpdate: onUpdateChainVestings
  } = useChainVestings(vestingContracts);
  const { setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();

  const [selectedProject, setSelectedProject] = useShallowState<ProjectOption>();

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
   * My recipes data from current(selected) organization
   *
   * User can have multiple vestings in 1 organization
   */
  const myRecipes = useMemo(
    () => recipes.filter((recipe) => recipe?.organizationId === selectedProject.value),
    [selectedProject.value, recipes]
  );

  /**
   * Sum of total allocations from current(selected) organization
   */
  const totalAllocations = useMemo(() => {
    return myRecipes.reduce((val, recipe) => val + Number(recipe?.allocations ?? 0), 0);
  }, [myRecipes]);

  const vestingDetails = useMemo(
    () =>
      vestingInfos.map((vestingInfo) => {
        const contract = contracts.find((c) => compareAddresses(c.data.address, vestingInfo.address));
        const singleVesting = vestings.find((v) => v.data.vestingContractId === contract?.id);
        return {
          id: contract?.id,
          vestingId: singleVesting?.id,
          tokenId: singleVesting?.data.tokenId,
          organizationId: singleVesting?.data.organizationId,
          ...vestingInfo
        };
      }),
    [vestingInfos, contracts, vestings]
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
    () => tokens.find((token) => token.data.organizationId === selectedProject?.value),
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

          // Update ChainVestings data
          onUpdateChainVestings(
            vestingInfo.address,
            ['unclaimed', 'withdrawn'],
            ['0', String(Number(vestingInfo.withdrawn) + Number(vestingInfo.unclaimed))]
          );

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

  return (
    <div className="w-full">
      <div className="mb-6 px-6 flex items-center gap-6">
        <div className="w-323 h-323 relative">
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
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            <StandardCard
              isLoading={isLoadingDetails}
              icon={<VestingScheduleIcon className="w-6 h-6" />}
              title="Token Name"
              content={String(token?.data.name)}
              contentType="text"
              contentIcon={<Image src={String(token?.data.logo)} alt="token-image" width={32} height={32} />}
            />
            <StandardCard
              isLoading={isLoadingDetails || !vestingDetail}
              icon={<VestingScheduleIcon className="w-6 h-6" />}
              title="Total granted"
              content={String(formatNumber(totalAllocations))}
              contentType="number"
            />
            <StandardCard
              isLoading={isLoadingDetails}
              icon={<VestingCalendarIcon className="w-6 h-6" />}
              title="Schedule"
              content={String(myRecipes?.length ?? 0)}
              contentType="text"
            />
            <StandardCard
              isLoading={isLoadingDetails}
              icon={<span className="w-2.5 h-2.5 rounded-full bg-[#00e396]" />}
              title="Withdrawn"
              content={Number(vestingDetail.withdrawn).toFixed(2)}
              contentType="number"
            />
            <StandardCard
              isLoading={isLoadingDetails}
              icon={<span className="w-2.5 h-2.5 rounded-full bg-[#008ffb]" />}
              title="Unclaimed"
              content={Number(vestingDetail.unclaimed).toFixed(2)}
              contentType="number"
            />
            <StandardCard
              isLoading={isLoadingDetails}
              icon={<span className="w-2.5 h-2.5 rounded-full bg-[#f9e597]" />}
              title="Total locked"
              content={Number(vestingDetail.locked).toFixed(2)}
              contentType="number"
            />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 px-6">
        {isLoadingVestings || isLoadingChainVesting
          ? Array.from(new Array(3)).map((_, index) => (
              <div key={index} className="animate-pulse w-full">
                <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
              </div>
            ))
          : vestings.map((singleVesting) => {
              const contract = contracts.find((c) => c.id === singleVesting.data.vestingContractId);
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
                  : undefined;

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
                  buttonLabel={`CLAIM ${Number(String(vestingInfo?.unclaimed)).toFixed(2)} ${getTokenSymbol(
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
  );
}