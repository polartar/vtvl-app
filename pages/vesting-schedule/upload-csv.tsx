import ImportCSVFlow from '@components/organisms/Forms/ImportCSVFlow';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useGlobalContext } from '@providers/global.context';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';

const UploadCSVConfiguration: NextPageWithLayout = () => {
  const {
    website: { name }
  } = useGlobalContext();
  const vestingScheduleFields = [{ label: 'saple', value: 'samepl' }];

  const vestingScheduleSteps = {
    step1: {
      title: 'Import details from a CSV file',
      description: 'Speed up the process by uploading a CSV file containing all your vesting requirements.',
      templateLabel: `${name ?? 'VTVL'} vesting schedule template`,
      templateUrl: '/',
      cancelButtonLabel: 'Back',
      confirmButtonLabel: 'Continue'
    },
    step2: {
      title: 'Map your details',
      description: 'Match your column headers to the respective categories on the left.',
      cancelButtonLabel: 'Back',
      confirmButtonLabel: 'Confirm'
    },
    step3: {
      title: 'Summary of vesting details',
      description: (
        <>
          Ensure your imported data is mapped correctly. Click '<strong>Back</strong>' to edit or '
          <strong>Confirm</strong>' to review the final summary.
        </>
      ),
      cancelButtonLabel: 'Back',
      confirmButtonLabel: 'Confirm'
    }
  };

  const handleCSVImport = (data: any) => {
    console.log('CSV!!', data);
  };
  return (
    <>
      <ImportCSVFlow
        fields={vestingScheduleFields}
        steps={vestingScheduleSteps}
        onCancel={() => Router.push('/vesting-schedule')}
        onComplete={handleCSVImport}
      />
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
UploadCSVConfiguration.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/upload-csv' }
  ];

  // Update these into a state coming from the context
  const wizardSteps = [
    {
      title: 'Import vesting details',
      desc: 'Upload CSV'
    },
    {
      title: 'Schedule summary',
      desc: 'Schedule created successfully!'
    }
  ];
  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={0}>
      {page}
    </SteppedLayout>
  );
};

export default UploadCSVConfiguration;
