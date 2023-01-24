import CardRadio from '@components/atoms/CardRadio/CardRadio';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import ProgressCircle from '@components/atoms/ProgressCircle/ProgressCircle';
import StatusIndicator from '@components/atoms/StatusIndicator/StatusIndicator';
import DropdownMenu from '@components/molecules/DropdownMenu/DropdownMenu';
import Table from '@components/molecules/Table/Table';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import VestingOverview from '@components/molecules/VestingOverview/VestingOverview';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import toDate from 'date-fns/toDate';
import { ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { useTransactionLoaderContext } from 'providers/transaction-loader.context';
import PlusIcon from 'public/icons/plus.svg';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction, IVesting } from 'types/models';
import { IRecipient } from 'types/vesting';
import { convertAllToOptions, formatDate, formatTime, getActualDateTime, minifyAddress } from 'utils/shared';
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getDuration,
  getNumberOfReleases,
  getReleaseFrequencyTimestamp
} from 'utils/vesting';

/**
 * This page should have an async fetch feature that gets the vesting schedule details from the database.
 */
const VestingScheduleProject: NextPageWithLayout = () => {
  const { account, library, activate, chainId } = useWeb3React();
  const { organizationId, safe } = useAuthContext();
  const { setTransactionStatus } = useTransactionLoaderContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { mintFormState, isTokenLoading } = useTokenContext();
  const { vestings: vestingSchedules, vestingContract } = useDashboardContext();

  const [selected, setSelected] = useState('manual');
  const [vestingScheduleDataCounts, setVestingScheduleDataCounts] = useState({
    totalSchedules: 0,
    pendingSchedules: 0,
    pendingApprovals: 0,
    pendingDeployments: 0,
    totalRecipients: 0,
    progress: { current: 0, total: 0 }
  });

  useEffect(() => {
    // Manually count all necessary data since we're fetching all of the schedules for this particular organization
    if (vestingSchedules.length > 0) {
      let inProgress = 0;
      let pendingSchedules = 0;
      let pendingDeployments = 0;
      let pendingApprovals = 0;
      let totalRecipients = 0;
      vestingSchedules.map((sched) => {
        inProgress += sched.data.status === 'LIVE' ? 1 : 0;
        pendingSchedules += sched.data.status === 'WAITING_FUNDS' || sched.data.status === 'INITIALIZED' ? 1 : 0;
        pendingDeployments += sched.data.status === 'WAITING_APPROVAL' ? 1 : 0;
        pendingApprovals += sched.data.status === 'WAITING_APPROVAL' ? 1 : 0;
        totalRecipients += sched.data.recipients.length;
      });

      setVestingScheduleDataCounts({
        totalSchedules: vestingSchedules?.length || 0,
        pendingSchedules,
        pendingDeployments,
        pendingApprovals,
        totalRecipients,
        progress: { current: inProgress, total: vestingSchedules?.length || 0 }
      });
    }
  }, [vestingSchedules]);

  useEffect(() => {
    if (isTokenLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isTokenLoading]);

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
      url: '/vesting-schedule/add-recipients'
    },
    import: {
      label: 'Upload CSV File',
      url: '/vesting-schedule/upload-csv'
    }
  };

  // const recipientTypes = convertAllToOptions(['All', 'Employee', 'Investor']);

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
  const CellProgress = ({ value, row }: any) => {
    const actualDates = getActualDateTime(row.original.data.details);
    let progress = 0;
    if (actualDates.startDateTime && actualDates.endDateTime && row.original.data.status === 'LIVE') {
      const totalSeconds = differenceInSeconds(actualDates.endDateTime, actualDates.startDateTime);
      const secondsFromNow = differenceInSeconds(new Date(), actualDates.startDateTime);
      progress = Math.round((secondsFromNow / totalSeconds) * 100);
    }
    return (
      <div className="row-center">
        <ProgressCircle value={progress} max={100} />
        {progress}%
      </div>
    );
  };

  // Renderer for cliff duration
  const CellCliff = ({ value }: any) => {
    const newValue = value.replace('-', ' ');
    return newValue.charAt(0).toUpperCase() + newValue.substring(1, newValue.length);
  };

  // Renderer for combined information -- Amount + Token name / symbol
  const CellAmount = ({ value }: any) => formatNumber(value);

  // Renderer for status
  const CellStatus = ({ value, row }: any) => {
    const statuses: any = {
      INITIALIZED: { color: 'dangerAlt', label: 'Initialized' },
      WAITING_APPROVAL: { color: 'dangerAlt', label: 'Approval pending' },
      WAITING_FUNDS: { color: 'warningAlt', label: 'Funds pending' },
      CREATING: { color: 'successAlt', label: 'Creating' },
      CREATED: { color: 'successAlt', label: 'Created' },
      LIVE: { color: 'infoAlt', label: 'Live' },
      COMPLETED: { color: 'gray', label: 'Completed' }
    };
    return (
      <div className="flex flex-row items-center gap-1">
        <Chip {...statuses[value]} size="small" rounded />
        {row.original.data.archive ? <Chip label="Archived" size="small" rounded color="grayAlt" /> : null}
      </div>
    );
  };

  // Renderer for more action items
  const CellActions = (props: any) => {
    const { data, id } = props.row.original;
    // const menuItems =
    //   (data as IVesting).status === 'COMPLETED' || (data as IVesting).status === 'LIVE'
    //     ? [{ label: 'Revoke', onClick: () => handleRevoke(id, data) }]
    //     : [
    //         {
    //           label: `${data.archive ? 'Unarchive' : 'Archive'}`,
    //           onClick: () => handleArchiving(id, data)
    //         }
    //       ];
    return (
      <table className="-my-3.5 -mx-6">
        <tbody>
          {data.recipients.map((recipient: IRecipient, rIndex: number) => {
            return (
              <tr key={`recipient-${rIndex}`} className="group">
                <td className="group-last:border-b-0">
                  <div className="py-2 flex items-center flex-nowrap">
                    <button
                      className="line small"
                      onClick={() => Router.push(`/vesting-schedule/${props.row.original.id}`)}>
                      Details
                    </button>
                    <DropdownMenu
                      items={
                        (data as IVesting).status === 'COMPLETED' || (data as IVesting).status === 'LIVE'
                          ? [{ label: 'Revoke', onClick: () => handleRevoke(id, data, rIndex) }]
                          : [
                              {
                                label: `${data.archive ? 'Unarchive' : 'Archive'}`,
                                onClick: () => handleArchiving(id, data)
                              }
                            ]
                      }
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Recipients' data -- loop through all recipients and apply table as well to provide
  // deeper level data on the vesting schedule.
  const CellRecipients = ({ row }: any) => {
    return row && row.original.data && row.original.data.recipients ? (
      // Negative margins to override the default TD paddings set from global css
      <table className="-my-3.5 -mx-6">
        <tbody>
          {row.original.data.recipients.map((recipient: IRecipient, rIndex: number) => {
            return (
              <tr key={`recipient-${rIndex}`} className="group">
                <td className="group-last:border-b-0">
                  <div className="w-20 py-2">{recipient.name ? recipient.name : '(Anonymous)'}</div>
                </td>
                <td className="group-last:border-b-0">
                  <div className="w-full py-2">
                    <Copy text={recipient.walletAddress}>{minifyAddress(recipient.walletAddress)}</Copy>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : null;
  };

  // Update color of row if the status of the vesting schedule record is COMPLETED
  const getTrProps = (rowInfo: any) => {
    if (rowInfo) {
      const { status, archive } = rowInfo.original.data;
      return {
        className: status === 'COMPLETED' ? 'bg-success-50' : archive ? 'bg-gray-50' : ''
      };
    }
    return {};
  };

  // Handles the archiving process
  const handleArchiving = async (id: string, data: IVesting) => {
    await updateVesting(
      {
        ...data,
        archive: !data.archive
      },
      id
    );
    toast.success(`Schedule: ${data.name} ${!data.archive ? '' : 'un'}archived!`);
    // getVestings(false);
  };

  // Handles revoking process
  const handleRevoke = async (id: string, data: IVesting, rIndex: number) => {
    if (data.status === 'COMPLETED' || data.status === 'LIVE') {
      try {
        setTransactionStatus('PENDING');
        const vestingContractInstance = new ethers.Contract(
          vestingContract?.data?.address ?? '',
          VTVL_VESTING_ABI.abi,
          library.getSigner()
        );
        const revokeTransaction = await vestingContractInstance.revokeClaim(data.recipients[rIndex].walletAddress);
        setTransactionStatus('IN_PROGRESS');
        await revokeTransaction.wait();
        await updateVesting(
          {
            ...data,
            status: 'REVOKED'
          },
          id
        );
        toast.success('Revoking is done successfully.');
        setTransactionStatus('SUCCESS');
      } catch (err) {
        console.log('handleRevoke - ', err);
        toast.success('Something went wrong. Try agaiin later.');
        setTransactionStatus('ERROR');
      }
    }
  };

  // Defines the columns used and their functions in the table
  const columns = useMemo(
    () => [
      {
        id: 'scheduleName',
        Header: '# Sched',
        accessor: 'data.name',
        Cell: CellScheduleName
      },
      {
        id: 'recipients',
        Header: 'Recipients',
        accessor: 'data.recipients',
        Cell: CellRecipients
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

  console.log('Data counts', vestingScheduleDataCounts);
  /**
   * This function is intended to be used as a callback for clicking the "Batch transaction" button in the Table component.
   * This will pass all the selected rows in the selectedRows argument.
   */

  const handleBatchProcess = async (selectedRows: []) => {
    try {
      if (!account || !library || !chainId) {
        activate(injected);
        return;
      }
      setTransactionStatus('PENDING');
      let addresses: any = [];
      let vestingStartTimestamps: any = [];
      let vestingEndTimestamps: any = [];
      let vestingCliffTimestamps: any = [];
      let vestingReleaseIntervals: any = [];
      let vestingLinearVestAmounts: any = [];
      let vestingCliffAmounts: any = [];
      const vestingIds = selectedRows.map((row: any) => row.id);
      selectedRows.forEach((row: any) => {
        const vesting = row.data;
        const vestingId = row.id;
        const cliffAmountPerUser =
          getCliffAmount(
            vesting.details.cliffDuration,
            +vesting.details.lumpSumReleaseAfterCliff,
            +vesting.details.amountToBeVested
          ) / vesting.recipients.length;
        const vestingAmountPerUser = +vesting.details.amountToBeVested / vesting.recipients.length - cliffAmountPerUser;
        const addresses1 = vesting.recipients.map((recipient: any) => recipient.walletAddress);
        const cliffReleaseDate =
          vesting.details.startDateTime && vesting.details.cliffDuration !== 'no-cliff'
            ? getCliffDateTime(
                new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()),
                vesting.details.cliffDuration
              )
            : '';
        const cliffReleaseTimestamp = cliffReleaseDate ? Math.floor(cliffReleaseDate.getTime() / 1000) : 0;
        const numberOfReleases =
          vesting.details.startDateTime && vesting.details.endDateTime
            ? getNumberOfReleases(
                vesting.details.releaseFrequency,
                cliffReleaseDate || new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()),
                new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis())
              )
            : 0;
        const actualStartDateTime =
          vesting.details.cliffDuration !== 'no-cliff' ? cliffReleaseDate : vesting.details.startDateTime;
        const vestingEndTimestamp =
          vesting.details.endDateTime && actualStartDateTime
            ? getChartData({
                start: actualStartDateTime,
                end: new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()),
                cliffDuration: vesting.details.cliffDuration,
                cliffAmount: cliffAmountPerUser,
                frequency: vesting.details.releaseFrequency,
                vestedAmount: vestingAmountPerUser
              }).projectedEndDateTime
            : // getProjectedEndDateTime(
              //   actualStartDateTime,
              //   new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()),
              //   numberOfReleases,
              //   vesting.details.releaseFrequency
              // )
              null;
        const vestingStartTimestamps1 = new Array(vesting.recipients.length).fill(
          cliffReleaseTimestamp
            ? cliffReleaseTimestamp
            : Math.floor((vesting.details.startDateTime as unknown as Timestamp).seconds)
        );
        const vestingEndTimestamps1 = new Array(vesting.recipients.length).fill(
          Math.floor(vestingEndTimestamp!.getTime() / 1000)
        );
        const vestingCliffTimestamps1 = new Array(vesting.recipients.length).fill(cliffReleaseTimestamp);
        const releaseFrequencyTimestamp = getReleaseFrequencyTimestamp(
          vesting.details.startDateTime as Date,
          vesting.details.releaseFrequency
        );
        const vestingReleaseIntervals1 = new Array(vesting.recipients.length).fill(releaseFrequencyTimestamp);
        const vestingLinearVestAmounts1 = new Array(vesting.recipients.length).fill(
          parseTokenAmount(vestingAmountPerUser, 18)
        );
        const vestingCliffAmounts1 = new Array(vesting.recipients.length).fill(
          parseTokenAmount(cliffAmountPerUser, 18)
        );

        addresses = [...addresses, ...addresses1];
        vestingStartTimestamps = [...vestingStartTimestamps, ...vestingStartTimestamps1];
        vestingEndTimestamps = [...vestingEndTimestamps, ...vestingEndTimestamps1];
        vestingCliffTimestamps = [...vestingCliffTimestamps, ...vestingCliffTimestamps1];
        vestingReleaseIntervals = [...vestingReleaseIntervals, ...vestingReleaseIntervals1];
        vestingLinearVestAmounts = [...vestingLinearVestAmounts, ...vestingLinearVestAmounts1];
        vestingCliffAmounts = [...vestingCliffAmounts, ...vestingCliffAmounts1];
      });
      const CREATE_CLAIMS_BATCH_FUNCTION =
        'function createClaimsBatch(address[] memory _recipients, uint40[] memory _startTimestamps, uint40[] memory _endTimestamps, uint40[] memory _cliffReleaseTimestamps, uint40[] memory _releaseIntervalsSecs, uint112[] memory _linearVestAmounts, uint112[] memory _cliffAmounts)';
      const CREATE_CLAIMS_BATCH_INTERFACE =
        'createClaimsBatch(address[],uint40[],uint40[],uint40[],uint40[],uint112[],uint112[])';
      const ABI = [CREATE_CLAIMS_BATCH_FUNCTION];
      const vestingContractInterface = new ethers.utils.Interface(ABI);
      const createClaimsBatchEncoded = vestingContractInterface.encodeFunctionData('createClaimsBatch', [
        addresses,
        vestingStartTimestamps,
        vestingEndTimestamps,
        vestingCliffTimestamps,
        vestingReleaseIntervals,
        vestingLinearVestAmounts,
        vestingCliffAmounts
      ]);

      if (safe?.address && account && chainId && organizationId) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const vestingContract = await fetchVestingContractByQuery(
          ['organizationId', 'chainId'],
          ['==', '=='],
          [organizationId, chainId]
        );
        const txData = {
          to: vestingContract?.data?.address ?? '',
          data: createClaimsBatchEncoded,
          value: '0'
        };
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
        const txHash = await safeSdk.getTransactionHash(safeTransaction);
        const signature = await safeSdk.signTransactionHash(txHash);
        setTransactionStatus('IN_PROGRESS');
        safeTransaction.addSignature(signature);
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        await safeService.proposeTransaction({
          safeAddress: safe.address,
          senderAddress: account,
          safeTransactionData: safeTransaction.data,
          safeTxHash: txHash,
          senderSignature: signature.data
        });

        if (account && organizationId) {
          const transactionId = await createTransaction({
            hash: txHash,
            safeHash: '',
            status: 'PENDING',
            to: vestingContract?.data?.address ?? '',
            type: 'ADDING_CLAIMS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId,
            chainId,
            vestingIds
          });
          await Promise.all(
            selectedRows.map(async (row: any) => {
              const vestingId = row.id;
              const vesting = row.data;
              await updateVesting(
                {
                  ...vesting,
                  status: 'WAITING_APPROVAL',
                  transactionId
                },
                vestingId
              );
            })
          );
        }
        toast.success('Transaction has been created successfully.');
        setTransactionStatus('SUCCESS');
      } else if (account && chainId && organizationId) {
        setTransactionStatus('PENDING');
        const vestingContract = await fetchVestingContractByQuery(
          ['organizationId', 'chainId'],
          ['==', '=='],
          [organizationId, chainId]
        );
        const vestingContractInstance = new ethers.Contract(
          vestingContract?.data?.address ?? '',
          VTVL_VESTING_ABI.abi,
          library.getSigner()
        );
        const addingClaimsTransaction = await vestingContractInstance.createClaimsBatch(
          addresses,
          vestingStartTimestamps,
          vestingEndTimestamps,
          vestingCliffTimestamps,
          vestingReleaseIntervals,
          vestingLinearVestAmounts,
          vestingCliffAmounts
        );
        const transactionData: ITransaction = {
          hash: addingClaimsTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: vestingContract?.data?.address ?? '',
          type: 'ADDING_CLAIMS',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds
        };
        const transactionId = await createTransaction(transactionData);
        await Promise.all(
          selectedRows.map(async (row: any) => {
            const vestingId = row.id;
            const vesting = row.data;
            await updateVesting(
              {
                ...vesting,
                status: 'WAITING_APPROVAL',
                transactionId
              },
              vestingId
            );
          })
        );
        setTransactionStatus('IN_PROGRESS');
        await addingClaimsTransaction.wait();
        updateTransaction(
          {
            ...transactionData,
            status: 'SUCCESS',
            updatedAt: Math.floor(new Date().getTime() / 1000)
          },
          transactionId
        );
        toast.success('Added schedules successfully.');
        setTransactionStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleCreateSignTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionStatus('ERROR');
    }
  };

  const [remaining, setRemaining] = useState(0);
  const [totalUsedSupply, setTotalUsedSupply] = useState(0);

  // Get the total used supply based on all the schedules
  useEffect(() => {
    if (vestingSchedules && vestingSchedules.length) {
      setTotalUsedSupply(vestingSchedules.reduce((prev, curr) => prev + +curr.data.details.amountToBeVested, 0));
    }
  }, [vestingSchedules]);

  // Sets the remaining based on the total supply
  useEffect(() => {
    if (totalUsedSupply && mintFormState.initialSupply) {
      setRemaining(+mintFormState.initialSupply - totalUsedSupply);
    }
  }, [totalUsedSupply, mintFormState.initialSupply]);

  return (
    <>
      {vestingSchedules?.length && mintFormState ? (
        <>
          <div className="w-full h-full">
            <p className="text-neutral-500 text-sm font-medium mb-2">Overview</p>
            <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
              <div>
                <TokenProfile {...mintFormState} className="mb-2" />
                <Copy text={mintFormState.address}>
                  <p className="text-sm font-medium text-netural-900">
                    Contract address: <span className="text-neutral-500">{mintFormState.address}</span>
                  </p>
                </Copy>
              </div>
              <div className="flex flex-row items-center justify-start gap-2">
                <button
                  className="secondary row-center"
                  onClick={() => Router.push('/vesting-schedule/add-recipients')}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Create Schedule</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-5 mb-6 border-b border-gray-200 w-full">
            <VestingOverview
              token={mintFormState.symbol}
              {...vestingScheduleDataCounts}
              remainingAllocation={remaining}
              totalAllocation={+mintFormState.initialSupply || 0}
            />
          </div>
          {/* <div className="grid sm:grid-cols-3 lg:grid-cols-10 gap-2 mt-7 mb-8">
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
          </div> */}
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
        </>
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
