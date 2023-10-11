import { Typography } from '@components/atoms/Typography/Typography';
import { formatNumber } from 'utils/token';

interface IAllocationStatus {
  progress: number; // interpret as in percent
  amount: number;
}

export interface IMilestoneVestingAllocationsProps {
  title?: string | JSX.Element;
  withdrawn: IAllocationStatus;
  unclaimed: IAllocationStatus;
  locked: IAllocationStatus;
}

const MilestoneVestingAllocations = (props: IMilestoneVestingAllocationsProps) => {
  return (
    <div>
      <div className="text-center mb-4 font-medium">
        <Typography>{props.title}</Typography>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <progress className="milestone w-full" value={props.withdrawn.progress} max={100} />
          <div className="px-2 py-1.5 border rounded-lg mt-5">
            <div className="flex flex-row items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
              <Typography size="caption" className="text-neutral-500 font-medium">
                Withdrawn
              </Typography>
            </div>
            <Typography className="text-neutral-900 font-medium">{formatNumber(props.withdrawn.amount)}</Typography>
          </div>
        </div>
        <div>
          <progress className="milestone w-full" value={props.unclaimed.progress} max={100} />
          <div className="px-2 py-1.5 border rounded-lg mt-5">
            <div className="flex flex-row items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
              <Typography size="caption" className="text-neutral-500 font-medium">
                Unclaimed
              </Typography>
            </div>
            <Typography className="text-neutral-900 font-medium">{formatNumber(props.unclaimed.amount)}</Typography>
          </div>
        </div>
        <div>
          <progress className="milestone w-full" value={props.locked.progress} max={100} />
          <div className="px-2 py-1.5 border rounded-lg mt-5">
            <div className="flex flex-row items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-300"></div>
              <Typography size="caption" className="text-neutral-500 font-medium">
                Total Locked
              </Typography>
            </div>
            <Typography className="text-neutral-900 font-medium">{formatNumber(props.locked.amount)}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneVestingAllocations;
