import Chip from '@components/atoms/Chip/Chip';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import ToggleSwitch from '@components/atoms/FormControls/ToggleSwitch/ToggleSwitch';
import CapTableOverview from '@components/molecules/CapTableOverview/CapTableOverview';
import Table from '@components/molecules/Table/Table';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import RecipientsIcon from 'public/icons/cap-table-recipients.svg';
import { ReactElement, useMemo, useState } from 'react';
import { convertAllToOptions, minifyAddress } from 'utils/shared';
import { formatNumber } from 'utils/token';

import { NextPageWithLayout } from './_app';

const CapTable: NextPageWithLayout = () => {
  const schedules = [
    { label: 'All', value: 'all' },
    { label: 'Viking-0132', value: 'viking-0132' }
  ];

  const [tab, setTab] = useState('all');

  const recipientTypes = convertAllToOptions(['Founder', 'Employee', 'Investor']);

  // Renderer for the recipient types for UI purpose
  const CellRecipientType = ({ value }: any) => <Chip label={value} rounded size="small" color="gray" />;

  // Renderer for combined information -- Company name + Wallet address
  const CellCompany = ({ row }: any) => (
    <div className="row-center">
      <RecipientsIcon className="w-6 h-6" />
      <div>
        <p className="text-sm text-medium text-neutral-900">{row.original.company}</p>
        {row.original.address ? (
          <p className="text-xs text-neutral-600 mt-0.5 underline" data-tip={row.original.address}>
            {minifyAddress(row.original.address)}
          </p>
        ) : null}
      </div>
    </div>
  );

  // Renderer for combined information -- Amount + Token name / symbol
  const CellAmount = ({ amount, token }: { amount: number; token: string }) => (
    <>
      {formatNumber(amount)} {token}
    </>
  );
  const CellTotalAmount = ({ row }: any) => (
    <CellAmount amount={row.original.totalAllocation} token={row.original.token} />
  );
  const CellClaimedAmount = ({ row }: any) => <CellAmount amount={row.original.claimed} token={row.original.token} />;
  const CellUnclaimedAmount = ({ row }: any) => (
    <CellAmount amount={row.original.unclaimed} token={row.original.token} />
  );
  const CellWithdrawnAmount = ({ row }: any) => (
    <CellAmount amount={row.original.withdrawn} token={row.original.token} />
  );

  // Renderer for the toggle switch in managing alerts for each schedule
  const CellToggleSwitch = (props: any) => {
    console.log('PROPS', props);
    const {
      value,
      row: { original, index },
      column: { getProps }
    } = props;
    const recordId = original.id;
    const callback = getProps().updateAlertStatus;
    return <ToggleSwitch checked={value} onChange={(value) => callback(value, recordId)} />;
  };

  // Defines the columns used and their functions in the table
  const columns = useMemo(
    () => [
      {
        id: 'recipientType',
        Header: 'Recipient type',
        accessor: 'recipientType',
        Cell: CellRecipientType
      },
      {
        id: 'company',
        Header: 'Company',
        Cell: CellCompany
      },
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name'
      },
      {
        id: 'totalAllocation',
        Header: 'Total allocation',
        accessor: 'totalAllocation',
        Cell: CellTotalAmount
      },
      {
        id: 'claimed',
        Header: 'Claimed',
        accessor: 'claimed',
        Cell: CellClaimedAmount
      },
      {
        id: 'unclaimed',
        Header: 'Unclaimed',
        accessor: 'unclaimed',
        Cell: CellUnclaimedAmount
      },
      {
        id: 'withdrawn',
        Header: 'Withdrawn',
        accessor: 'withdrawn',
        Cell: CellWithdrawnAmount
      },
      {
        id: 'alert',
        Header: 'Alert',
        accessor: 'alert',
        Cell: CellToggleSwitch,
        getProps: () => ({
          updateAlertStatus: (value: any, id: string) => {
            // Save the update alert status to the DB
            console.log('ALERT STATUS', value, id);
          }
        })
      },
      {
        id: 'action',
        Header: '',
        accessor: 'action'
      }
    ],
    []
  );

  // Sample data
  const data = [
    {
      id: '19xlnbgasldfkADSf',
      recipientType: 'Employee',
      company: 'Biconomy',
      token: 'BICO',
      address: '0xx01ABC37371231LAWRENCE83ADRESS193810984',
      name: 'Felix Grimsson',
      totalAllocation: 50000,
      claimed: 0,
      unclaimed: 0,
      withdrawn: 0,
      alert: true
    },
    {
      id: '20xlnbgasldfkADSf',
      recipientType: 'Employee',
      company: 'Biconomy',
      token: 'BICO',
      address: '0xx02ABC1212231ADA83ADRESS193810984',
      name: 'Chris Ride',
      totalAllocation: 50000,
      claimed: 0,
      unclaimed: 0,
      withdrawn: 0,
      alert: false
    },
    {
      id: '21xlnbgasldfkADSf',
      recipientType: 'Employee',
      company: 'Biconomy',
      token: 'BICO',
      address: '0xx03ABC98731231DANNY83ADRESS193810984',
      name: 'Mark Jemison',
      totalAllocation: 50000,
      claimed: 0,
      unclaimed: 0,
      withdrawn: 0,
      alert: false
    },
    {
      id: '22xlnbgasldfkADSf',
      recipientType: 'Employee',
      company: 'Biconomy',
      token: 'BICO',
      address: '0xx04ABC6431231NISHA83ADRESS193810984',
      name: 'Andrew Tereshkova',
      totalAllocation: 50000,
      claimed: 0,
      unclaimed: 0,
      withdrawn: 0,
      alert: true
    }
  ];

  return (
    <>
      <div className="w-full">
        <h1 className="h2 text-neutral-900 mb-2">Cap Table</h1>
        <p className="text-neutral-500 text-sm mb-5">You can find below the history of the transactions.</p>
        <div className="p-5 mb-6 border-b border-gray-200">
          <CapTableOverview
            token="BICO"
            schedules={3}
            totalRecipients={4}
            claimed={10000000}
            unclaimed={40000000}
            totalWithdrawn={5000000}
            totalAllocation={50000000}
          />
        </div>
        <label>
          <span>Schedules</span>
        </label>
        <BarRadio
          name="statuses"
          options={schedules}
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          variant="tab"
        />
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-7 mb-8">
          <SelectInput label="Recipient type" options={recipientTypes} />
          <SelectInput label="Company" options={recipientTypes} />
          <Input label="Withdrawn" placeholder="any" />
          <Input label="Claimed" placeholder="any" />
          <Input label="Unclaimed" placeholder="any" />
        </div>

        <Table columns={columns} data={data} pagination={true} exports={true} />
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
CapTable.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'Cap Table', route: '/cap-table' }];
  return (
    <SteppedLayout title="Cap Table" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default CapTable;