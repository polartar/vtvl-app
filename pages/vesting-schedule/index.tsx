import CardRadio from '@components/atoms/CardRadio/CardRadio';
import Chip from '@components/atoms/Chip/Chip';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import Loader from '@components/atoms/Loader/Loader';
import ProgressCircle from '@components/atoms/ProgressCircle/ProgressCircle';
import StatusIndicator from '@components/atoms/StatusIndicator/StatusIndicator';
import DropdownMenu from '@components/molecules/DropdownMenu/DropdownMenu';
import Table from '@components/molecules/Table/Table';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import VestingOverview from '@components/molecules/VestingOverview/VestingOverview';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import toDate from 'date-fns/toDate';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { fetchTokenByQuery } from 'services/db/token';
import { fetchVestingSchedules, fetchVestingsByQuery } from 'services/db/vesting';
import { IToken, IVesting } from 'types/models';
import { convertAllToOptions, formatDate, formatTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { getDuration } from 'utils/vesting';

interface IVestingSchedules {
  id: string;
  data: IVesting;
}

/**
 * This page should have an async fetch feature that gets the vesting schedule details from the database.
 */
const VestingScheduleProject: NextPageWithLayout = () => {
  const { organizationId } = useAuthContext();
  const [isFetchingToken, setIsFetchingToken] = useState(true);
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(true);
  const [vestingScheduleDataCounts, setVestingScheduleDataCounts] = useState({
    totalSchedules: 0,
    pendingSchedules: 0,
    pendingApprovals: 0,
    totalRecipients: 0,
    progress: { current: 0, total: 0 }
  });

  // First we need to get the contract
  const [vestingToken, setVestingToken] = useState<IToken | undefined>();
  const getVestingContract = async () => {
    try {
      if (organizationId) {
        const token = await fetchTokenByQuery('organizationId', '==', organizationId);
        setVestingToken(token?.data);
        setIsFetchingToken(false);
        console.log('Vesting contract', token);
      } else throw 'Organization id does not exist';
    } catch (err) {
      console.log('Error on getting vesting contract', err);
      setIsFetchingToken(false);
    }
  };

  // Then get the schedules
  const [vestingSchedules, setVestingSchedules] = useState<IVestingSchedules[]>();

  const getVestings = async () => {
    try {
      if (organizationId) {
        const schedules = await fetchVestingsByQuery('organizationId', '==', organizationId);
        setVestingSchedules(schedules);
        setIsFetchingSchedules(false);
        // Manually count all necessary data since we're fetching all of the schedules for this particular organization
        let inProgress = 0;
        let pendingSchedules = 0;
        let pendingApprovals = 0;
        let totalRecipients = 0;
        schedules.map((sched) => {
          inProgress += sched.data.status === 'LIVE' ? 1 : 0;
          pendingSchedules += sched.data.status === 'WAITING_FUNDS' ? 1 : 0;
          pendingApprovals += sched.data.status === 'WAITING_APPROVAL' ? 1 : 0;
          totalRecipients += sched.data.recipients.length;
        });

        setVestingScheduleDataCounts({
          totalSchedules: schedules?.length || 0,
          pendingSchedules: pendingSchedules,
          pendingApprovals: pendingApprovals,
          totalRecipients: totalRecipients,
          progress: { current: inProgress, total: schedules?.length || 0 }
        });
        console.log('Schedules', schedules, vestingSchedules);
      } else throw 'Organization id does not exist';
    } catch (err) {
      console.log('error', err);
      setIsFetchingSchedules(false);
    }
  };

  useEffect(() => {
    getVestingContract();
    getVestings();
  }, []);

  const { mintFormState } = useTokenContext();
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
        label: (
          <>
            I want to upload a CSV <br />
            <small className="text-secondary-900 text-xs font-bold">Coming soon!</small>
          </>
        ),
        disabled: true
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

  const recipientTypes = convertAllToOptions(['All', 'Employee', 'Investor']);

  // Renderer for schedule name -- with scenario for COMPLETED status
  const CellScheduleName = ({ value, row, ...props }: any) => {
    return (
      <div className="row-center">
        {row.original.data.status === 'COMPLETED' ? <StatusIndicator size="small" color="success" /> : null}
        {value}
      </div>
    );
  };

  // Renderer for dates -- currently, the DB contains the start and end date in nanoseconds and seconds
  const CellDate = ({ value }: any) => {
    return (
      <>
        {formatDate(toDate(value.toDate()))}
        <br />
        {formatTime(toDate(value.toDate()))}
      </>
    );
  };

  // Renderer for progress field
  const CellProgress = ({ value }: any) => (
    <div className="row-center">
      <ProgressCircle value={value} max={100} />
      {value}%
    </div>
  );

  // Renderer for cliff duration
  const CellCliff = ({ value }: any) => {
    const newValue = value.replace('-', ' ');
    return newValue.charAt(0).toUpperCase() + newValue.substring(1, newValue.length);
  };

  // Renderer for combined information -- Amount + Token name / symbol
  const CellAmount = ({ value }: any) => formatNumber(value);

  // Renderer for status
  const CellStatus = ({ value }: any) => {
    const statuses: any = {
      WAITING_APPROVAL: { color: 'dangerAlt', label: 'Approval pending' },
      WAITING_FUNDS: { color: 'warningAlt', label: 'Funds pending' },
      CREATING: { color: 'successAlt', label: 'Creating' },
      CREATED: { color: 'successAlt', label: 'Created' },
      LIVE: { color: 'infoAlt', label: 'Live' },
      COMPLETED: { color: 'gray', label: 'Completed' }
    };
    return <Chip {...statuses[value]} size="small" rounded />;
  };

  // Renderer for more action items
  const CellActions = (props: any) => {
    const menuItems = [{ label: 'Revoke', onClick: () => alert('Revoke clicked') }];
    return (
      <div className="row-center">
        <button className="line small" onClick={() => Router.push(`/vesting-schedule/${props.row.original.id}`)}>
          Details
        </button>
        <DropdownMenu items={menuItems} />
      </div>
    );
  };

  // Update color of row if the status of the vesting schedule record is COMPLETED
  const getTrProps = (rowInfo: any) => {
    if (rowInfo) {
      return {
        className: rowInfo.original.status === 'COMPLETED' ? 'bg-success-50' : ''
      };
    }
    return {};
  };

  // Defines the columns used and their functions in the table
  const columns = useMemo(
    () => [
      {
        id: 'scheduleName',
        Header: '# Sched',
        accessor: 'data.scheduleName',
        Cell: CellScheduleName
      },
      {
        id: 'startDate',
        Header: 'Start',
        accessor: 'data.details.startDateTime',
        Cell: CellDate
      },
      {
        id: 'endDate',
        Header: 'End',
        accessor: 'data.details.endDateTime',
        Cell: CellDate
      },
      {
        id: 'progress',
        Header: 'Progress',
        accessor: 'progress',
        Cell: CellProgress
      },
      {
        id: 'cliffRelease',
        Header: 'Cliff release',
        accessor: 'data.details.cliffDuration',
        Cell: CellCliff
      },
      {
        id: 'vestingPeriod',
        Header: 'Vesting period',
        accessor: 'vestingPeriod',
        Cell: ({ row }: any) =>
          getDuration(row.original.data.details.startDateTime.toDate(), row.original.data.details.endDateTime.toDate())
      },
      {
        id: 'totalAllocation',
        Header: 'Total allocations',
        accessor: 'data.details.amountToBeVested',
        Cell: CellAmount
      },
      {
        id: 'status',
        Header: 'Status',
        accessor: 'data.status',
        Cell: CellStatus
      },
      {
        id: 'requiredConfirmation',
        Header: 'Required conf.',
        accessor: 'requiredConfirmation'
      },
      {
        id: 'action',
        Header: '',
        accessor: 'action',
        Cell: CellActions,
        getProps: () => ({
          updateAlertStatus: (value: any, id: string) => {
            // Save the update alert status to the DB
            console.log('ALERT STATUS', value, id);
          }
        })
      }
    ],
    []
  );

  // Sample data
  // const data = [
  //   {
  //     id: '19xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 0,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'WAITING_FUNDS',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '20xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 30,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'COMPLETED',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '21xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 22,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'LIVE',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '22xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 65,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'CREATING',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '23xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 82,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'COMPLETED',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '24xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 100,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'CREATED',
  //     requiredConfirmation: '2 out of 3'
  //   },
  //   {
  //     id: '25xlnbgasldfkADSf',
  //     scheduleName: 'Viking-0123',
  //     startDate: 'Aug 06, 2022 07:00 (GST)',
  //     endDate: 'Nov 13, 2022 23:00 (GST)',
  //     progress: 100,
  //     cliffRelease: 'No Cliff',
  //     vestingPeriod: '3 months',
  //     totalAllocation: 50000,
  //     status: 'WAITING_APPROVAL',
  //     requiredConfirmation: '2 out of 3'
  //   }
  // ];

  console.log('Data counts', vestingScheduleDataCounts);
  /**
   * This function is intended to be used as a callback for clicking the "Batch transaction" button in the Table component.
   * This will pass all the selected rows in the selectedRows argument.
   */
  const handleBatchProcess = (selectedRows: []) => {
    console.log('Here are the selected rows', selectedRows);
  };

  return (
    <>
      {isFetchingToken || isFetchingSchedules ? (
        <Loader progress={90} />
      ) : vestingSchedules?.length && vestingToken ? (
        <div className="w-full">
          <p className="text-neutral-500 text-sm font-medium mb-2">Overview</p>
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
            <div>
              <TokenProfile {...mintFormState} className="mb-2" />
              <p className="text-sm font-medium text-netural-900">
                Contract address: <span className="text-neutral-500">{mintFormState.address}</span>
              </p>
            </div>
            <div className="flex flex-row items-center justify-start gap-2">
              <button className="secondary row-center" onClick={() => Router.push('/vesting-schedule/configure')}>
                <PlusIcon className="w-5 h-5" />
                <span className="whitespace-nowrap">Create Schedule</span>
              </button>
            </div>
          </div>
          <div className="p-5 mb-6 border-b border-gray-200">
            <VestingOverview
              token={vestingToken.symbol}
              {...vestingScheduleDataCounts}
              remainingAllocation={10000000}
              totalAllocation={vestingToken.initialSupply || 0}
            />
          </div>
          <div className="grid sm:grid-cols-3 lg:grid-cols-10 gap-2 mt-7 mb-8">
            <Input
              label="Schedule name"
              placeholder="Enter schedule"
              className="col-span-2 sm:col-span-1 lg:col-span-2"
            />
            <SelectInput label="Start" options={recipientTypes} />
            <SelectInput label="End" options={recipientTypes} />
            <SelectInput label="Progress" options={recipientTypes} />
            <SelectInput label="Cliff release" options={recipientTypes} />
            <SelectInput label="Status" options={recipientTypes} />
            <Input label="Amount" placeholder="Enter the amount" className="lg:col-span-2" />
          </div>
          <Table
            columns={columns}
            data={vestingSchedules}
            getTrProps={getTrProps}
            selectable
            pagination
            batchOptions={{
              label: 'Batch transactions',
              onBatchProcessClick: handleBatchProcess
            }}
          />
        </div>
      ) : (
        <>
          <h1 className="h2 font-medium text-center">Create your first vesting schedule</h1>
          <p className="text-sm text-neutral-500 mb-6">Please select one of the options below:</p>
          <div role="radiogroup" className="flex flex-row items-center justify-center gap-5 mb-10">
            {userAction.options.map((option, optionIndex) => (
              <CardRadio
                key={`card-radio-${option.value}-${optionIndex}`}
                {...option}
                disabled={option.disabled}
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
      )}
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
