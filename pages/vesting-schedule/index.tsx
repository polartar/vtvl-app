import CardRadio from '@components/atoms/CardRadio/CardRadio';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useState } from 'react';

/**
 * This page should have an async fetch feature that gets the product details from the database.
 */
const VestingScheduleProject: NextPageWithLayout = () => {
  const [hasVestingSchedule, setHasVestingSchedule] = useState(false);
  const [selected, setSelected] = useState('manual');

  const userAction = {
    options: [
      {
        image: '/images/vesting-manual.svg',
        value: 'manual',
        label: <>I want to manually input the details</>
      },
      {
        image: '/images/vesting-import.svg',
        value: 'import',
        label: <>I want to upload a CSV</>
      }
    ],
    name: 'userAction'
  };

  const selections: Record<string, Record<string, string>> = {
    manual: {
      label: 'Create Schedule',
      url: '/vesting-schedule/configure'
    },
    import: {
      label: 'Upload CSV File',
      url: '/vesting-schedule/upload-csv'
    }
  };

  return (
    <>
      {!hasVestingSchedule ? (
        <>
          <h1 className="h2 font-medium text-center">Create your first vesting schedule</h1>
          <p className="text-sm text-neutral-500 mb-6">Please select one of the options below:</p>
          <div role="radiogroup" className="flex flex-row items-center justify-center gap-5 mb-10">
            {userAction.options.map((option, optionIndex) => (
              <CardRadio
                key={`card-radio-${option.value}-${optionIndex}`}
                {...option}
                checked={selected === option.value}
                name="grouped-radio"
                onChange={() => setSelected(option.value)}
              />
            ))}
          </div>
          <button className="primary" onClick={() => Router.push(selections[selected].url)}>
            {selections[selected].label}
          </button>
        </>
      ) : null}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
VestingScheduleProject.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'Vesting schedule', route: '/vesting-schedule' }];
  return (
    <SteppedLayout title="Vesting schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default VestingScheduleProject;
