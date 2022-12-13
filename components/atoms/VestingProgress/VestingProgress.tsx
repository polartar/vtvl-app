import { formatNumber } from 'utils/token';

import Chip from '../Chip/Chip';

interface IVestingProgress {
  // e.g., 30 days left, 1 week left etc
  duration: string;
  // from 0 - 100 - Interpreted as percentage
  progress: number;
}

const VestingProgress = ({ duration = '', progress = 0 }: IVestingProgress) => {
  return (
    <>
      <div className="row-center justify-between text-xs font-medium text-neutral-500 mb-2.5">
        <span>
          Vesting progress <small>({formatNumber(progress, 0)}%)</small>
        </span>
        <Chip label={duration} color="primaryAlt" rounded size="small" />
      </div>
      <progress value={progress.toString()} max="100" className="w-full">
        {progress}%
      </progress>
    </>
  );
};

export default VestingProgress;
