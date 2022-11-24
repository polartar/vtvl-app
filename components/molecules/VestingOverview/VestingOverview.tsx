import ProgressCircle from '@components/atoms/ProgressCircle/ProgressCircle';
import Decimal from 'decimal.js';
import Router from 'next/router';
import RecipientsIcon from 'public/icons/cap-table-recipients.svg';
import SchedulesIcon from 'public/icons/cap-table-schedules.svg';
import PlusIcon from 'public/icons/plus.svg';
import ApprovalsIcon from 'public/icons/vesting-approval.svg';
import { convertToUSD } from 'utils/shared';
import { formatNumber } from 'utils/token';

interface VestingProgress {
  current: number;
  total: number;
}

interface VestingOverviewProps {
  token: string;
  totalSchedules: number;
  pendingSchedules: number;
  pendingApprovals: number;
  totalRecipients: number;
  progress: VestingProgress;
  remainingAllocation: number | Decimal;
  totalAllocation: number | Decimal;
}

const VestingOverview = ({
  token,
  totalSchedules,
  totalRecipients,
  progress,
  pendingApprovals,
  pendingSchedules,
  remainingAllocation,
  totalAllocation
}: VestingOverviewProps) => {
  return (
    <>
      <div className="grid sm:grid-cols-5 md:grid-cols-7 gap-3 xl:gap-6">
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Total schedules</p>
          <div className="flex flex-row items-center gap-2 paragraphy-large-semibold text-neutral-900">
            <SchedulesIcon className="w-6 h-6" />
            {totalSchedules}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Pending schedules</p>
          <div className="flex flex-row items-center gap-2 paragraphy-large-semibold text-neutral-900">
            <SchedulesIcon className="w-6 h-6" />
            {pendingSchedules}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Pending approvals</p>
          <div className="flex flex-row items-center gap-2 paragraphy-large-semibold text-neutral-900">
            <ApprovalsIcon className="w-6 h-6" />
            {pendingApprovals}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Recipients</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <div className="row-center mb-6">
              <RecipientsIcon className="w-6 h-6" />
              {totalRecipients}
            </div>
            <button
              className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-2 py-1 row-center"
              onClick={() => {}}>
              Learn more <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">In progress</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <div className="row-center mb-6">
              <ProgressCircle value={progress.current} max={progress.total} />
              {progress.current}/{progress.total}
            </div>
            <button
              className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-2 py-1 row-center"
              onClick={() => {}}>
              Learn more <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Remaining</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            {formatNumber(remainingAllocation)} {token}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Total supply</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <p className="mb-2">
              {formatNumber(totalAllocation)} {token}
            </p>
            <div className="paragraphy-small-semibold text-success-500">= ${convertToUSD(totalAllocation)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VestingOverview;
