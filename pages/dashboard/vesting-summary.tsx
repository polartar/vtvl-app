import BackButton from '@components/atoms/BackButton/BackButton';
import Chip from '@components/atoms/Chip/Chip';
import Form from '@components/atoms/FormControls/Form/Form';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import ScheduleSummary from '@components/molecules/ScheduleSummary/ScheduleSummary';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { NextPageWithLayout } from '../_app';

interface IVestingSummaryData {
  amountToBeVested: number;
}

const DashboardVestingSummary: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();
  // Use form to initially assign default values
  const {
    handleSubmit,
    watch,
    getFieldState,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      amountToBeVested: 0
    }
  });

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const [editMode, setEditMode] = useState(false);

  const activities = [
    {
      icon: 'success',
      text: 'Gnosis Safe integrated successfully',
      date: new Date(2022, 9, 21, 10, 30)
    },
    {
      icon: 'warning',
      text: '3 vesting schedule needs approval',
      date: new Date(2022, 9, 14, 9, 22)
    },
    {
      icon: 'warning',
      text: 'Vesting contract not yet created',
      date: new Date(2022, 9, 12, 21, 16)
    },
    {
      icon: 'success',
      text: 'Beneficiaries added',
      date: new Date(2022, 8, 28, 11, 32)
    }
  ];

  const sampleRecipients = [
    'Nisha',
    'Vivian',
    'Lawrence',
    'Marian',
    'Kevin',
    'Pritesh',
    'Mikhail',
    'Ada',
    'Danny',
    'Arvin'
  ];
  const sampleSchedule = {
    startDateTime: new Date(2022, 10, 2, 1, 30),
    endDateTime: new Date(2022, 11, 25, 12),
    lumpSumReleaseAfterCliff: 25,
    amountToBeVested: 50000
  };

  const tokenSupply = mintFormState.initialSupply || 100000;

  const amountToBeVested = { value: watch('amountToBeVested'), state: getFieldState('amountToBeVested') };

  // Handle the changes made when updating the amount to be vested.
  const handleMinChange = (e: any) => {
    console.log('Min changed', e.target.value);
    setValue('amountToBeVested', +e.target.value);
  };

  // Handle the submit of the form
  const onSubmit: SubmitHandler<IVestingSummaryData> = (data) => {
    console.log('Form Submitted', data);
    // Show error when present
    // setError(true);
    // setMessage('Oh no! Something went wrong!');

    toast.success(<SuccessToast />);
    setEditMode(false);
  };

  const SuccessToast = () => (
    <div>
      <p className="paragraphy-small-medium">Amount vested updated!</p>
      <p className="paragraphy-small">
        New total vested amount is {amountToBeVested.value} {mintFormState.symbol || 'Token'}
      </p>
    </div>
  );

  console.log(activities);
  return (
    <>
      <h1 className="h2 font-medium text-center mb-10">Vesting Summary</h1>
      <Form
        isSubmitting={isSubmitting}
        error={error}
        success={success}
        message={message}
        className="w-full mb-6 max-w-2xl"
        onSubmit={handleSubmit(onSubmit)}>
        <ScheduleSummary
          name="Voyager-0123"
          tokenPerUser="6,250 BICO"
          beneficiaries={4}
          totalPeriod="4 days, 3 hours"
          createdBy="Satoshi S."
        />
        <div className="py-5 mb-5 border-b border-neutral-200">
          <ScheduleDetails
            {...sampleSchedule}
            token={mintFormState.symbol || 'Token'}
            cliffDuration="1-day"
            releaseFrequency="weekly"
            hint={false}
          />
        </div>
        <label>
          <span>Recipients</span>
        </label>
        <div className="flex flex-row flex-wrap gap-2 pb-5 border-b border-neutral-200">
          {sampleRecipients.map((recipient) => (
            <Chip rounded label={recipient} color="random" />
          ))}
        </div>
        {editMode ? (
          <div className="flex flex-row flex-wrap gap-2 py-5 border-b border-neutral-200">
            <LimitedSupply
              label="Amount to be vested"
              required
              initial={+amountToBeVested.value}
              maximum={+tokenSupply}
              onMinChange={handleMinChange}
              onUseMax={() => setValue('amountToBeVested', +tokenSupply)}
              maxReadOnly
            />
          </div>
        ) : null}
        <div className="flex flex-row justify-between items-center pt-5">
          <BackButton label="Back to dashboard" onClick={() => Router.push('/dashboard')} />
          <div className="flex flex-row items-center gap-3">
            {editMode ? (
              <button className="primary" type="submit">
                Update
              </button>
            ) : (
              <>
                <button className="primary line" type="button" onClick={() => setEditMode(true)}>
                  Edit
                </button>
                <button className="primary" type="button">
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      </Form>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
DashboardVestingSummary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Vesting summary', route: '/dashboard/vesting-summary' }
  ];
  return (
    <SteppedLayout title="Vesting summary" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default DashboardVestingSummary;
