import Chip from '@components/atoms/Chip/Chip';
import { Typography } from '@components/atoms/Typography/Typography';
import CloseIcon from 'public/icons/close.svg';
import FlagIcon from 'public/icons/flag.svg';

import MilestoneVestingAllocations, { IMilestoneVestingAllocationsProps } from './Allocations';
import MilestoneVestingItem, { IMilestoneVestingItemProps } from './Item';
import MilestoneVestingSection from './Section';

export interface IMilestoneVestingProps {
  name: string | JSX.Element;
  totalAllocation: string;
  totalDuration: string;
  totalRecipients: number;
  allocations: IMilestoneVestingAllocationsProps;
  milestones: IMilestoneVestingItemProps[];
  onClose?: () => void;
  actions?: JSX.Element;
}

const MilestoneVesting = ({ ...props }: IMilestoneVestingProps) => {
  return (
    <>
      <div className="sticky z-10 top-0 bg-white shadow-sm flex flex-row items-center justify-between gap-4 px-6 py-3">
        <div className="flex flex-row items-center gap-3" data-aos="fade-left">
          <FlagIcon className="w-[22px]" />
          <Typography size="paragraph" className="font-bold">
            {props.name}
          </Typography>
          <Chip label="Vested Milestone" rounded color="gray" size="small" />
        </div>
        {props.onClose ? (
          <div className="cursor-pointer p-1 group" onClick={props.onClose} data-aos="fade-left" data-aos-delay="300">
            <CloseIcon className="w-4 h-4 text-neutral-800 transition-all group-hover:rotate-180" />
          </div>
        ) : null}
      </div>
      <div data-aos="fade-left" data-aos-delay="300">
        <MilestoneVestingSection>
          <MilestoneVestingAllocations
            {...props.allocations}
            title={
              <>
                Progress of <span className="font-bold text-primary-900">{props.milestones.length}</span> Milestone
                {props.milestones.length > 1 ? 's' : ''}
              </>
            }
          />
        </MilestoneVestingSection>

        {props.milestones.map((milestone, mindex) => (
          <MilestoneVestingSection key={`milestone-${mindex}`}>
            <MilestoneVestingItem {...milestone} totalAllocation={props.totalAllocation} />
          </MilestoneVestingSection>
        ))}

        <MilestoneVestingSection>
          <div className="grid grid-cols-3 gap-3 text-neutral-800 font-medium">
            <div className="flex flex-col gap-0.5">
              <Typography size="caption" className="font-bold">
                Recipients
              </Typography>
              <Typography size="caption">{props.totalRecipients}</Typography>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Typography size="caption" className="font-bold">
                Total Duration
              </Typography>
              <Typography size="caption">{props.totalDuration}</Typography>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <Typography size="caption" className="font-bold">
                Total Allocation
              </Typography>
              <Typography size="caption">{props.totalAllocation}</Typography>
            </div>
          </div>
        </MilestoneVestingSection>

        {props.actions ? <MilestoneVestingSection>{props.actions}</MilestoneVestingSection> : null}
      </div>
    </>
  );
};

export default MilestoneVesting;
