import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import CapTableOverview from '@components/molecules/CapTableOverview/CapTableOverview';
import Table from '@components/molecules/Table/Table';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { ethers } from 'ethers';
import RecipientsIcon from 'public/icons/cap-table-recipients.svg';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { TCapTableRecipientTokenDetails } from 'types/models/token';
import { minifyAddress } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

import { NextPageWithLayout } from './_app';

const CapTable: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();
  const [tab, setTab] = useState({ label: 'All', value: 'all' });
  const [filteredRecipientsData, setFilteredRecipientsData] = useState<TCapTableRecipientTokenDetails[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const { loading, hideLoading } = useLoaderContext();
  const { totalAllocation, totalWithdrawn, totalClaimable, vestings, recipientTokenDetails } = useDashboardContext();
  console.log(recipientTokenDetails);
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
  const CellAmount = ({ amount }: any) => {
    return (
      <>
        {formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(amount))))} {mintFormState.symbol}
      </>
    );
  };
  const CellTotalAmount = ({ row }: any) => <CellAmount amount={row.original.totalAllocation} />;
  const CellClaimedAmount = ({ row }: any) => <CellAmount amount={row.original.claimed} />;
  const CellUnclaimedAmount = ({ row }: any) => <CellAmount amount={row.original.unclaimed} />;
  const CellLockedTokens = ({ row }: any) => <CellAmount amount={row.original.lockedTokens} />;

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
        Header: 'Withdrawn',
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
        id: 'lockedTokens',
        Header: 'Locked tokens',
        accessor: 'lockedTokens',
        Cell: CellLockedTokens
      }
    ],
    [mintFormState, recipientTokenDetails, schedules]
  );

  // Filter the table data based on selected tab value (schedule)
  useEffect(() => {
    if (tab.value !== 'all') {
      console.log('Filter start', vestings, tab);
      // Filter the data based on the schedule
      const filteredRecipients = [...recipientTokenDetails].filter((recipient) => recipient.scheduleId === tab.value);
      setFilteredRecipientsData(filteredRecipients);
    } else {
      setFilteredRecipientsData(recipientTokenDetails);
    }
    console.log('REcipient data', recipientTokenDetails);
  }, [recipientTokenDetails, tab]);

  useEffect(() => {
    // Setup vesting schedule list on bar radio
    if (vestings && vestings.length) {
      const vestingData = vestings.filter((vd) => !vd.data.archive);
      if (vestingData && vestingData.length) {
        console.log('vesting data here is ', vestingData);
        // Set the bar radio selector based on the schedules fetched
        setSchedules([
          { label: 'All', value: 'all' },
          ...vestingData.map((vd) => ({ label: vd.data.name, value: vd.id }))
        ]);
      }
    }
  }, [vestings]);

  // Ensure loading state is correct
  useEffect(() => {
    if (recipientTokenDetails.length && schedules.length && mintFormState) {
      hideLoading();
    }
  }, [loading, recipientTokenDetails, schedules, mintFormState]);

  return (
    <>
      <div className="w-full h-full">
        <h1 className="h2 text-neutral-900 mb-2">Cap Table</h1>
        <p className="text-neutral-500 text-sm mb-5">You can find below the history of the transactions.</p>
        {recipientTokenDetails && recipientTokenDetails.length && mintFormState ? (
          <>
            <div className="p-5 mb-6 border-b border-gray-200">
              <CapTableOverview
                token={mintFormState.symbol || 'Token'}
                schedules={vestings.length}
                totalRecipients={recipientTokenDetails.length}
                claimed={totalWithdrawn}
                unclaimed={totalClaimable}
                totalAllocation={totalAllocation}
              />
            </div>
            <label>
              <span>Schedules</span>
            </label>

            <Select value={tab} options={schedules} onChange={(e: any) => setTab(e)} />
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-7 mb-8"></div>

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
