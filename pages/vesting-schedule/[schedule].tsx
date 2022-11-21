import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Loader from '@components/atoms/Loader/Loader';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import ScheduleSummary from '@components/molecules/ScheduleSummary/ScheduleSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import WarningIcon from 'public/icons/warning.svg';
import { ReactElement, useEffect, useState } from 'react';
import { fetchVesting } from 'services/db/vesting';
import { IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';

const VestingScheduleDetailed: NextPageWithLayout = () => {
  const router = useRouter();
  const { schedule } = router.query;
  const [fetching, setFetching] = useState(false);
  const [vestingSchedule, setVestingSchedule] = useState<IVesting | undefined>(undefined);
  const { mintFormState } = useTokenContext();
  const { organizationId } = useAuthContext();
  // const organizationId = 'MYvgDyXEY5kCfxdIvtY8'; // mock data

  const getVestingScheduleDetails = async () => {
    console.log('fetching schedule', schedule);
    // Get the schedule details
    try {
      const getVestingSchedule = await fetchVesting(schedule as string);
      console.log('Vesting Schedule UI', getVestingSchedule);
      if (getVestingSchedule) {
        const actualDateTime = getActualDateTime(getVestingSchedule.details);
        setVestingSchedule({
          ...getVestingSchedule,
          details: {
            ...getVestingSchedule?.details,
            startDateTime: actualDateTime.startDate,
            endDateTime: actualDateTime.endDate
          }
        });
        setFetching(false);
      }
    } catch (err) {
      // something went wrong
      setFetching(false);
    }
  };

  useEffect(() => {
    if (schedule) {
      setFetching(true);
      getVestingScheduleDetails();
    }
  }, [schedule]);

  // Need to count and loop all approvers
  const wizardSteps = [
    {
      title: 'Vitalik Armstrong',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip label="Initiator" color="grayAlt" rounded />
        </div>
      )
    },
    {
      title: 'Pomp Aldrin',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip
            label={
              <p className="row-center">
                <WarningIcon className="w-4 h-4" />
                Approval needed
              </p>
            }
            color="warningAlt"
            rounded
          />
        </div>
      )
    },
    {
      title: 'Michael Glenn',
      desc: (
        <div className="text-center">
          <span className="row-center justify-center mt-2 mb-3">
            <img src="/images/etherscan.png" alt="Etherscan" />
            0x467.....a263
          </span>
          <Chip
            label={
              <p className="row-center">
                <WarningIcon className="w-4 h-4" />
                Approval needed
              </p>
            }
            color="warningAlt"
            rounded
          />
        </div>
      )
    }
  ];

  return (
    <>
      {fetching ? (
        <Loader progress={90} />
      ) : vestingSchedule ? (
        <>
          <h1 className="h2 text-neutral-900 mb-10">VOYAGER-0123</h1>
          <div className="w-full mb-6 panel max-w-2xl">
            <h2 className="text-lg font-medium text-neutral-900 mb-1.5 text-center">Schedule Details</h2>
            <p className="text-sm text-neutral-500 text-center mb-5">
              <strong>2</strong> out of <strong>3</strong> owners is required to confirm this schedule
            </p>
            <StepWizard steps={wizardSteps} status={1} size="small" className="mx-auto" showAllLabels />
            <div className="border-t border-gray-200 py-6 mt-6 grid sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Token per user</span>
                <p className="paragraphy-small-medium text-neutral-900">5,250 {mintFormState.symbol || 'Token'}</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Total locked token</span>
                <p className="paragraphy-small-medium text-neutral-900">10,000,000 {mintFormState.symbol || 'Token'}</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Beneficiaries</span>
                <p className="paragraphy-small-medium text-neutral-900">4</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Total Period</span>
                <p className="paragraphy-small-medium text-neutral-900">63 days</p>
              </div>
              <div>
                <span className="paragraphy-tiny-medium text-neutral-500">Created by</span>
                <p className="paragraphy-small-medium text-neutral-900">Satoshi S.</p>
              </div>
            </div>
            <ScheduleDetails {...vestingSchedule.details} token={mintFormState.symbol || 'Token'} />
            <div className="row-center justify-center mt-6 pt-6 border-t border-gray-200">
              <Button className="secondary">Approve</Button>
              <Button className="primary">Reject</Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
VestingScheduleDetailed.getLayout = function getLayout(page: ReactElement) {
  const router = useRouter();
  const { schedule } = router.query;
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Transaction review', route: `/vesting-schedule/${schedule}` }
  ];
  return (
    <SteppedLayout title="Vesting schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default VestingScheduleDetailed;
