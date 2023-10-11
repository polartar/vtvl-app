import { IMilestoneVestingProps } from '@components/molecules/MilestoneVesting';
import { useMemo } from 'react';
import { IMilestoneForm } from 'types/milestone';

export const useMilestoneVesting = () => {
  // Transforms the data into a MilestoneVesting component readable object
  const transformData: (milestoneVesting: { id: string; data: IMilestoneForm }) => any = (milestoneVesting) => {
    const { allocation: totalAllocation, recipientName: name, milestones } = milestoneVesting.data;
    return {
      totalAllocation,
      name,
      milestones,
      totalDuration: '1 year 6 months',
      totalRecipients: 1,
      allocations: {
        withdrawn: { progress: 0, amount: 1000 },
        unclaimed: { progress: 0, amount: 1000 },
        locked: { progress: 0, amount: 1000 }
      }
    };
  };

  // Transform the milestone into MilestoneVestingAllocation component readable object
  // Still to do
  const transformMilestones = () => {};

  return useMemo(
    () => ({
      transformData
    }),
    []
  );
};
