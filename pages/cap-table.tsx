import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import ToggleSwitch from '@components/atoms/FormControls/ToggleSwitch/ToggleSwitch';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import CapTableOverview from '@components/molecules/CapTableOverview/CapTableOverview';
import Table from '@components/molecules/Table/Table';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import Decimal from 'decimal.js';
import { useAuthContext } from 'providers/auth.context';
import RecipientsIcon from 'public/icons/cap-table-recipients.svg';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { fetchMember } from 'services/db/member';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { IVesting } from 'types/models';
import { convertAllToOptions, getUserTokenDetails, minifyAddress } from 'utils/shared';
import { formatNumber } from 'utils/token';

import { NextPageWithLayout } from './_app';

const CapTable: NextPageWithLayout = () => {
  const { chainId } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { user, organizationId } = useAuthContext();
  const [showCapTable, setShowCapTable] = useState(false);
  const [tab, setTab] = useState('all');
  const [vestingsData, setVestingsData] = useState<any[]>([]);
  const [recipientsData, setRecipientsData] = useState<any[]>([]);
  const [filteredRecipientsData, setFilteredRecipientsData] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const recipientTypes = convertAllToOptions(['Founder', 'Employee', 'Investor']);
  const { loading, showLoading, hideLoading } = useLoaderContext();
  const [totalClaimed, setTotalClaimed] = useState<Decimal | number>(0);
  const [totalUnClaimed, setTotalUnClaimed] = useState<Decimal | number>(0);
  const [totalAllocation, setTotalAllocation] = useState(0);

  useEffect(() => {
    setRecipientsData([]);
    if (mintFormState.name && organizationId && chainId) {
      setUpCapTable();
    }
  }, [mintFormState.name, organizationId, chainId]);

  // Renderer for the recipient types for UI purpose
  const CellRecipientType = ({ value }: any) => <Chip label={value} rounded size="small" color="gray" />;

  // Renderer for combined information -- Company name + Wallet address
  const CellCompany = ({ row }: any) => (
    <div className="row-center">
      <RecipientsIcon className="w-6 h-6" />
      <div>
        <p className="text-sm text-medium text-neutral-900">{row.original.company}</p>
        {row.original.address ? (
          <Copy text={row.original.address}>
            <p className="text-xs text-neutral-600 mt-0.5 underline">{minifyAddress(row.original.address)}</p>
          </Copy>
        ) : null}
      </div>
    </div>
  );

  // Renderer for combined information -- Amount + Token name / symbol
  const CellAmount = ({ amount }: { amount: number }) => (
    <>
      {formatNumber(amount)} {mintFormState.symbol}
    </>
  );
  const CellTotalAmount = ({ row }: any) => <CellAmount amount={row.original.totalAllocation} />;
  const CellClaimedAmount = ({ row }: any) => <CellAmount amount={row.original.claimed} />;
  const CellUnclaimedAmount = ({ row }: any) => <CellAmount amount={row.original.unclaimed} />;
  const CellWithdrawnAmount = ({ row }: any) => <CellAmount amount={row.original.withdrawn} />;

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
        Header: 'Amount vested to-date',
        accessor: 'unclaimed',
        Cell: CellUnclaimedAmount
      }
      // {
      //   id: 'withdrawn',
      //   Header: 'Withdrawn',
      //   accessor: 'withdrawn',
      //   Cell: CellWithdrawnAmount
      // }
      // {
      //   id: 'alert',
      //   Header: 'Alert',
      //   accessor: 'alert',
      //   Cell: CellToggleSwitch,
      //   getProps: () => ({
      //     updateAlertStatus: (value: any, id: string) => {
      //       // Save the update alert status to the DB
      //       console.log('ALERT STATUS', value, id);
      //     }
      //   })
      // },
      // {
      //   id: 'action',
      //   Header: '',
      //   accessor: 'action'
      // }
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

  const setUpCapTable = async () => {
    const memberInfo = user?.memberInfo?.org_id
      ? user?.memberInfo
      : user
      ? await fetchMember(user?.uid || '')
      : undefined;

    const initialVestingData = await fetchVestingsByQuery(
      ['organizationId', 'chainId'],
      ['==', '=='],
      [memberInfo?.org_id || organizationId || '', chainId!]
    );
    const vestingData = initialVestingData.filter((vd) => !vd.data.archive);
    if (vestingData && vestingData.length) {
      console.log('vesting data here is ', vestingData);
      // Set the bar radio selector based on the schedules fetched
      setSchedules([
        { label: 'All', value: 'all' },
        ...vestingData.map((vd) => ({ label: vd.data.name, value: vd.id }))
      ]);

      let sumUnclaimed = new Decimal(0);
      let sumClaimed = new Decimal(0);
      let sumAllocation = 0;

      // Loop through each of the vesting schedules
      const transformedVestings = await [...vestingData].reduce(
        async (accu: any, obj: { id: string; data: IVesting }) => {
          const acc = await accu;
          // This is based on `amount to be vested` per schedule
          sumAllocation += obj.data.details.amountToBeVested;
          // Loop through all the recipients under a specific vesting schedule
          const o = await [...obj.data.recipients].reduce(async (accum: any, o: any) => {
            const a = await accum;
            // Based on claimed, unclaimed per each recipient per vesting schedule
            const recipientTokenDetails = await getUserTokenDetails(obj, o.walletAddress, chainId!);
            sumUnclaimed = sumUnclaimed.plus(recipientTokenDetails.claimableAmount);
            sumClaimed = sumClaimed.plus(recipientTokenDetails.claimedAmount);
            // sumUnclaimed += obj.data.details.amountClaimed;
            // sumClaimed += obj.data.details.amountUnclaimed;
            return [
              ...a,
              {
                scheduleId: obj.id,
                name: o.name,
                company: o.company,
                recipientType: o.recipientType[0]?.label,
                address: o.walletAddress,
                // Ensure that the totalAllocation for each recipient is divided by the number of recipients
                totalAllocation: new Decimal(obj.data.details.amountToBeVested)
                  .div(new Decimal(obj.data.recipients.length))
                  .toDP(6, Decimal.ROUND_UP),
                // Set recipient's claimed and unclaimed datas
                claimed: recipientTokenDetails.claimedAmount,
                unclaimed: recipientTokenDetails.claimableAmount
              }
            ];
          }, Promise.resolve([]));
          return [...acc, ...o];
        },
        Promise.resolve([])
      );

      // const newRecipients = await transformedVestings();
      console.group('Before transformed vestings ');
      console.log('Recipients', transformedVestings);
      console.log('ClaimedTotal', sumClaimed);
      console.log('Unclaimed Total', sumUnclaimed);
      console.groupEnd();
      setTotalUnClaimed(sumUnclaimed);
      setTotalClaimed(sumClaimed);
      setTotalAllocation(sumAllocation);
      setVestingsData(vestingData);
      setRecipientsData(transformedVestings);
      setShowCapTable(true);
      hideLoading();
      console.group('After transformed vestings ');
      console.log('Recipients', transformedVestings);
      console.log('ClaimedTotal', sumClaimed);
      console.log('Unclaimed Total', sumUnclaimed);
      console.groupEnd();
    }
  };

  // Todo Arvin: Optimize / Abstract this along with the transformedVesting one to avoid repeating codes
  useEffect(() => {
    if (tab !== 'all') {
      console.log('Filter start', vestingsData, tab);
      // Filter the data based on the schedule
      const filteredRecipients = [...recipientsData].filter((recipient) => recipient.scheduleId === tab);
      setFilteredRecipientsData(filteredRecipients);
    } else {
      setFilteredRecipientsData(recipientsData);
    }
    console.log('REcipient data', recipientsData);
  }, [recipientsData, tab]);

  // Ensure loading state is correct
  useEffect(() => {
    console.log('Loading recipients', loading, recipientsData);
    if (!loading && !recipientsData.length) {
      showLoading();
    }
  }, [loading]);

  return (
    <>
      <div className="w-full h-full">
        <h1 className="h2 text-neutral-900 mb-2">Cap Table</h1>
        <p className="text-neutral-500 text-sm mb-5">You can find below the history of the transactions.</p>
        {showCapTable ? (
          <>
            <div className="p-5 mb-6 border-b border-gray-200">
              <CapTableOverview
                token={mintFormState.symbol || 'Token'}
                schedules={vestingsData.length}
                totalRecipients={recipientsData.length}
                claimed={totalClaimed}
                unclaimed={totalUnClaimed}
                totalWithdrawn={0}
                totalAllocation={totalAllocation}
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
              {/* <SelectInput label="Recipient type" options={recipientTypes} />
              <SelectInput label="Company" options={recipientTypes} />
              <Input label="Withdrawn" placeholder="any" />
              <Input label="Claimed" placeholder="any" />
              <Input label="Unclaimed" placeholder="any" /> */}
            </div>

            <Table columns={columns} data={filteredRecipientsData} pagination={true} />
          </>
        ) : (
          <EmptyState
            image="/images/cryptocurrency-trading-bot.gif"
            title="No data found"
            description={<>Add vesting schedules first</>}
          />
        )}
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
