import { Typography } from '@components/atoms/Typography/Typography';
import { twMerge } from 'tailwind-merge';

interface IMilestoneVestingProgressProps {
  value: number;
  total: number;
}

interface IProgressIndicatorProps {
  active?: boolean;
}

const ProgressIndicator = ({ active = false }: IProgressIndicatorProps) => (
  <div className="relative z-[2] w-0 h-full flex flex-col items-center justify-end border-l border-dashed border-gray-300 overflow-visible">
    <div
      className={twMerge(
        'w-[9px] h-[9px] mr-px mb-2 rounded-full flex-shrink-0',
        active ? 'bg-success-500' : 'bg-gray-300'
      )}></div>
  </div>
);

const MilestoneVestingProgress = (props: IMilestoneVestingProgressProps) => {
  const totalMilestones = Array.from({ length: props.total }, (_, i) => i + 1);
  return (
    <div>
      <div className="relative h-14 w-full bg-gray-100 rounded-lg overflow-hidden flex flex-row items-center justify-between px-2">
        {totalMilestones.map((n) => (
          <ProgressIndicator active={n <= props.value} />
        ))}
        <div
          className="absolute top-0 left-0 bg-green-300/25 border-r border-success-500 h-full z-[1]"
          style={{ width: `${(props.value / props.total) * 100}%` }}></div>
      </div>
      <div className="flex flex-row items-center justify-between mt-1 px-2">
        <Typography size="caption" className="font-semibold text-neutral-400">
          Start
        </Typography>
        <Typography size="caption" className="font-semibold text-neutral-400">
          End
        </Typography>
      </div>
    </div>
  );
};

export default MilestoneVestingProgress;
