import VestingScheduleIcon from '@assets/s_vestingSchedule.svg';
import Chip from '@components/atoms/Chip/Chip';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import { useDashboardContext } from '@providers/dashboard.context';
import intlFormatDistance from 'date-fns/intlFormatDistance';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import ContractsIcon from 'public/icons/contracts-colored.svg';
import { useMemo } from 'react';
import { IRecipientDoc, ISafe } from 'types/models';
import { IVestingDoc } from 'types/models/vesting';
import { IVestingContractDoc } from 'types/models/vestingContract';

import VestingSummaryTable from './VestingSummaryTable';

const VestingSummary = ({
  vestingSchedule,
  symbol,
  safe,
  recipients
}: {
  vestingSchedule: IVestingDoc;
  symbol: string;
  safe: ISafe | undefined;
  recipients: IRecipientDoc[];
}) => {
  const { vestingContracts } = useDashboardContext();

  const vestingRecipients = useMemo(
    () => recipients?.filter((recipient) => recipient.data.vestingId === vestingSchedule.id),
    [recipients, vestingSchedule.id]
  );

  const tokenPerUser = useMemo(() => {
    const recipientsNum = vestingRecipients.length;
    if (recipientsNum > 0) {
      return (vestingSchedule.data.details.amountToBeVested / recipientsNum).toFixed(1);
    } else {
      return 0;
    }
  }, [vestingRecipients, vestingSchedule]);

  const vestingContract = useMemo(() => {
    return vestingContracts.find((v) => v.id === vestingSchedule.data.vestingContractId);
  }, [vestingContracts]);

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContract as IVestingContractDoc,
    [vestingSchedule],
    recipients
  );
  console.log({ vestingSchedulesInfo });
  const totalLocked = useMemo(() => {
    if (vestingSchedulesInfo && vestingSchedulesInfo.length > 0) {
      return vestingSchedulesInfo.reduce((total, schedule) => total.add(schedule.locked), BigNumber.from(0));
    } else {
      return 0;
    }
  }, [vestingSchedulesInfo]);

  return (
    <>
      <div className="flex flex-row items-center gap-1 justify-center mb-3">
        <Chip
          color={vestingSchedule.data.status === 'LIVE' ? 'successAlt' : 'grayAlt'}
          label={vestingSchedule.data.status || ''}
          size="small"
          rounded
        />
      </div>
      <div className="flex justify-center text-center text-2xl font-semibold text-neutral-900">Schedule summary</div>

      <div className="grid grid-cols-3 mb-5 font-medium mt-10">
        <div>
          <label className="text-sm text-neutral-600 flex flex-row items-center gap-2 mb-2.5">
            <VestingScheduleIcon className="h-4" />
            Schedule
          </label>
          <p className="text-neutral-900">{vestingSchedule.data.name}</p>
        </div>

        <div>
          <label className="text-sm text-neutral-600 flex flex-row items-center gap-2 mb-2.5">
            <ContractsIcon className="h-4" />
            Contract
          </label>
          <p className="text-neutral-900">{vestingContract?.data.name}</p>
        </div>

        {safe && safe?.address ? (
          <div>
            <label className="text-sm text-neutral-600 flex flex-row items-center gap-2 mb-2.5">
              <img src="/icons/safe.png" className="w-4" />
              Safe
            </label>
            <p className="text-neutral-900">{safe.org_name}</p>
          </div>
        ) : null}
      </div>

      <hr className="my-6" />

      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label>
            <span className=" text-xs  neutral-text">Token per user</span>
          </label>
          <p className="">{tokenPerUser}</p>
        </div>

        <div>
          <label>
            <span className=" text-xs  neutral-text">Total locked tokens</span>
          </label>
          <p className=" ">{formatEther(totalLocked)}</p>
        </div>

        <div>
          <label>
            <span className=" text-xs  neutral-text">Recipients</span>
          </label>
          <p>{vestingRecipients.length}</p>
        </div>

        <div>
          <label>
            <span className=" text-xs  neutral-text">Total Period</span>
          </label>
          <p>
            {intlFormatDistance(
              vestingSchedule.data.details.startDateTime || 0,
              vestingSchedule.data.details.endDateTime || 0
            )}
          </p>
        </div>

        <div>
          <label>
            <span className=" text-xs  neutral-text">Created by</span>
          </label>
          <p>Vitalik</p>
        </div>
      </div>

      <hr className="my-6" />
      <VestingSummaryTable recipients={vestingRecipients} />

      <div className="py-5 mb-5 border-b border-neutral-200">
        <ScheduleDetails {...vestingSchedule.data.details} token={symbol || 'Token'} />
      </div>
    </>
  );
};

export default VestingSummary;
