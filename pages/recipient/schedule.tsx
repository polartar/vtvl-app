import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useRouter } from 'next/router';
import WarningIcon from 'public/icons/warning.svg';
import { useEffect, useState } from 'react';
import { fetchVesting } from 'services/db/vesting';
import { IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';

const RecipientSchedule = () => {
  const { mintFormState } = useTokenContext();
  const [vestingSchedule, setVestingSchedule] = useState<IVesting | undefined>(undefined);
  const { loading, hideLoading, showLoading } = useLoaderContext();
  const { recipient } = useAuthContext();

  const router = useRouter();

  const getVestingScheduleDetails = async () => {
    const schedule = recipient?.data.vestingId;
    // Get the schedule details
    try {
      const getVestingSchedule = await fetchVesting(schedule as string);
      if (getVestingSchedule) {
        const actualDateTime = getActualDateTime(getVestingSchedule.details);
        setVestingSchedule({
          ...getVestingSchedule,
          details: {
            ...getVestingSchedule?.details,
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime
          }
        });
        hideLoading();
      }
    } catch (err) {
      // something went wrong
      hideLoading();
    }
  };

  useEffect(() => {
    if (recipient) {
      showLoading();
      getVestingScheduleDetails();
    }
  }, [recipient]);

  if (recipient?.data.walletAddress) {
    router.push('/claim-portal');
  }
  return (
    <div className="w-full mb-6 panel max-w-2xl">
      <h1 className=" text-neutral-900 text-center">Your Schedule</h1>
      <h2 className="text-neutral-900 ">{vestingSchedule?.name}</h2>
      <h3 className="text-lg font-medium text-neutral-900 mb-1.5 text-left">Schedule Details</h3>
      <div className="border-t border-gray-200 py-6 mt-6   gap-3">
        {!loading && vestingSchedule ? (
          <ScheduleDetails {...vestingSchedule.details} token={mintFormState.symbol || 'Token'} />
        ) : null}
        <hr className="my-6" />
        <div className="text-neutral-500 text-sm">Your token allocations</div>
        <div className="text-neutral-900 font-bold">
          {recipient?.data.allocations} {mintFormState.symbol || 'Token'}
        </div>
        <hr className="my-6" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Chip
            label={
              <div className="flex flex-row items-center gap-2">
                <WarningIcon className="w-4 h-4" />
                Please confirm which wallet address you want to proceed with
              </div>
            }
            color="warningAlt"
            rounded
          />
          <Button className="primary" onClick={() => router.push('/recipient/confirm')}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipientSchedule;
