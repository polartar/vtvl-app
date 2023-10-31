import TransactionApiService from '@api-services/TransactionApiService';
import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import Button from '@components/atoms/Button/Button';
import CardRadio from '@components/atoms/CardRadio/CardRadio';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import ProgressCircle from '@components/atoms/ProgressCircle/ProgressCircle';
import PromptModal from '@components/atoms/PromptModal/PromptModal';
import StatusIndicator from '@components/atoms/StatusIndicator/StatusIndicator';
import { Typography } from '@components/atoms/Typography/Typography';
import DropdownMenu from '@components/molecules/DropdownMenu/DropdownMenu';
import MilestoneVesting from '@components/molecules/MilestoneVesting';
import Table from '@components/molecules/Table/Table';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import VestingScheduleFilter from '@components/molecules/VestingScheduleFilter';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import ContractsProfile from '@components/organisms/VestingContracts/VestingContractsProfile';
import VestingSummary from '@components/organisms/VestingSchedule/VestingSummary';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import useChainVestingContracts from '@hooks/useChainVestingContracts';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useDrawer } from 'hooks/useDrawer';
import useIsAdmin from 'hooks/useIsAdmin';
import Router, { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { useTransactionLoaderContext } from 'providers/transaction-loader.context';
import PlusIcon from 'public/icons/plus.svg';
import VestingMilestoneBasedIcon from 'public/icons/vesting-milestone-based.svg';
import VestingTimeBasedIcon from 'public/icons/vesting-time-based.svg';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipient, IVesting } from 'types/models';
import { IVestingDoc } from 'types/models/vesting';
import { compareAddresses } from 'utils';
import { TOAST_IDS } from 'utils/constants';
import { convertToActualDateTime, formatDate, formatTime, getActualDateTime, minifyAddress } from 'utils/shared';
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
  const router = useRouter();
  const { account, library, activate, chainId } = useWeb3React();

  const { setTransactionStatus, updateTransactions } = useTransactionLoaderContext();
  const { organizationId, currentSafe } = useAuthContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { mintFormState, isTokenLoading } = useTokenContext();
  const {
    vestings: vestingSchedules,
    recipients,
    vestingContracts,
    milestoneVestings,
    fetchDashboardData
  } = useDashboardContext();
  const { editSchedule, setShowDeleteModal, deleteSchedulePrompt, setShowVestingSelectModal } = useVestingContext();
  const [selectedSchedule, setSelectedSchedule] = useState<IVestingDoc>();
  const [selectedMilestoneVesting, setSelectedMilestoneVesting] = useState<IVestingDoc>();
  const [selected, setSelected] = useState('manual');
  const [vestingScheduleDataCounts, setVestingScheduleDataCounts] = useState({
    totalSchedules: 0,
    pendingSchedules: 0,
    pendingApprovals: 0,
    pendingDeployments: 0,
    totalRecipients: 0,
    progress: { current: 0, total: 0 }
  });
  const [filter, setFilter] = useState<{
    keyword: string;
    status: 'ALL' | 'FUND' | 'INITIALIZED' | 'LIVE' | 'PENDING';
  }>({ keyword: '', status: 'ALL' });
  const [vestingContract, setVestingContract] = useState<IVestingContract | undefined>();

  const isAdmin = useIsAdmin(currentSafe ? currentSafe.address : account ? account : '', vestingContract);

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContracts,
    vestingSchedules,
    recipients
  );

  console.log('SCHEDULES INFO', vestingSchedulesInfo);

  const getVestingInfoByContract = useCallback(
    (contractAddress: string) => {
      const vestings = vestingSchedulesInfo.filter((vi) => compareAddresses(vi.address, contractAddress));
      let allocation = BigNumber.from(0),
        unclaimed = BigNumber.from(0),
        withdrawn = BigNumber.from(0),
        locked = BigNumber.from(0);
      vestings.forEach((vesting) => {
        allocation = allocation.add(vesting.allocation);
        unclaimed = unclaimed.add(vesting.unclaimed);
        withdrawn = withdrawn.add(vesting.withdrawn);
        locked = locked.add(vesting.locked);
      });

      const vestingContract = vestingContracts.find((contract) => compareAddresses(contract.address, contractAddress));

      return {
        address: contractAddress,
        recipient: '',
        allocation: allocation,
        unclaimed: unclaimed,
        withdrawn: withdrawn,
        locked: locked,
        reserved: vestings.length
          ? BigNumber.from(vestingContract?.balance || '0').sub(vestings[0].numTokensReservedForVesting || '0')
          : BigNumber.from(0)
      };
    },
    [vestingSchedulesInfo, vestingContracts]
  );

  const vestingContractsInfo = useMemo(() => {
    return vestingContracts.map((vestingContract) => getVestingInfoByContract(vestingContract.address || ''));
  }, [vestingSchedulesInfo, getVestingInfoByContract, vestingContracts]);

  console.log('MILESTONE VESTINGS', milestoneVestings);

  const filteredVestingSchedules = useMemo(() => {
    return vestingSchedules && vestingSchedules.length > 0
      ? vestingSchedules
          .filter((vesting) => {
            if (filter.keyword && !vesting.data.name?.toLowerCase().includes(filter.keyword.toLowerCase())) {
              return false;
            }
            if (filter.status === 'ALL') {
              return true;
            }
            if (filter.status === 'FUND') {
              return vesting.data.status === 'WAITING_FUNDS';
            }
            if (filter.status === 'INITIALIZED') {
              return vesting.data.status === 'INITIALIZED';
            }
            if (filter.status === 'LIVE') {
              return vesting.data.status === 'LIVE';
            }
            if (filter.status === 'PENDING') {
              return vesting.data.status === 'WAITING_APPROVAL' || vesting.data.status === 'APPROVED';
            }
          })
          .map((vesting) => {
            return {
              ...vesting,
              data: {
                ...vesting.data,
                recipients: recipients
                  .filter((recipient) => recipient.vestingId === vesting.id)
                  .map((recipient) => recipient)
              }
            };
          })
      : [];
  }, [vestingSchedules, recipients, filter]);

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
        totalRecipients += recipients.filter((recipient) => recipient.vestingId === sched.id).length;
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
        image: { src: '/images/vesting-manual.svg' },
        value: 'manual',
        label: <>I want to manually input the details</>
      },
      {
        image: { src: '/images/vesting-import.svg' },
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

  // Vesting schedule type tabs
  const [tab, setTab] = useState('time-based');
  const vestingTabs = useMemo(
    () => [
      {
        label: 'Time-based',
        value: 'time-based',
        // description: 'Place holder for the time-based vesting schedules.',
        icon: <VestingTimeBasedIcon className="w-4 h-4" />,
        counter: vestingSchedules.length
      }
      // {
      //   label: 'Milestone-based',
      //   value: 'milestone-based',
      //   // description: 'Place holder for the milestone-based vesting schedules.',
      //   icon: <VestingMilestoneBasedIcon className="w-4 h-4" />,
      //   counter: milestoneVestings.length
      // }
    ],
    [vestingSchedules, milestoneVestings]
  );
  const handleTabChange = (e: any) => {
    // Show the list based on what tab is active (time-based or milestone-based)
    setTab(e.target.value);
    console.log('TAB CHANGE', e.target.value);
  };

  // const recipientTypes = convertAllToOptions(['All', 'Employee', 'Investor']);
  const { Drawer, showDrawer, hideDrawer, open } = useDrawer({});

  const handleScheduleClick = (rowData: any) => {
    console.log('Showing schedule', rowData, tab);
    switch (tab) {
      case 'time-based':
        router.push(`/vesting-schedule/${rowData.original.id}`);
        break;
      case 'milestone-based':
        // LOAD MILESTONE DATA HERE
        showDrawer();
        break;
      default:
        break;
    }
  };

  // SAMPLE DATA --- START
  const allocations = {
    withdrawn: { amount: 6250, progress: 50 },
    unclaimed: { amount: 1250, progress: 10 },
    locked: { amount: 18750, progress: 20 }
  };

  const milestones = [
    {
      title: 'Milestone Title 01',
      active: true,
      description:
        'This vesting milestone allocates 75% of tokens based on performance goals. As goals are achieved, recipients receive 1,565.5 tokens monthly, promoting alignment with company objectives and rewarding hard work and dedication.',
      duration: '1 year',
      allocation: '15% = 60,000',
      releaseAmount: '5,000',
      releaseFrequency: 'monthly',
      totalMonths: 12,
      progress: 2,
      remaining: '50,000',
      released: '10,000',
      unlockDate: 1687342168000,
      actions: (
        <>
          <Button className="primary font-semibold" size="small" onClick={hideDrawer}>
            Approved Milestone
          </Button>
          <Button className="primary font-semibold" size="small" outline onClick={hideDrawer}>
            View Report
          </Button>
        </>
      )
    },
    {
      title: 'Milestone Title 02',
      active: false,
      description:
        'This vesting milestone allocates 75% of tokens based on performance goals. As goals are achieved, recipients receive 1,565.5 tokens monthly, promoting alignment with company objectives and rewarding hard work and dedication.',
      duration: '1 year',
      allocation: '60% = 240,000',
      releaseAmount: '20,000',
      releaseFrequency: 'monthly',
      totalMonths: 12,
      progress: 0,
      remaining: '240,000',
      released: '0',
      unlockDate: 1687342168000
    },
    {
      title: 'Milestone Title 03',
      active: false,
      description:
        'This vesting milestone allocates 75% of tokens based on performance goals. As goals are achieved, recipients receive 1,565.5 tokens monthly, promoting alignment with company objectives and rewarding hard work and dedication.',
      duration: '4 months',
      allocation: '25% = 100,000',
      releaseAmount: '25,000',
      releaseFrequency: 'monthly',
      totalMonths: 4,
      progress: 0,
      remaining: '100,000',
      released: '0',
      unlockDate: 1687342168000
    }
  ];
  // SAMPLE DATA --- END

  // Renderer for schedule name -- with scenario for COMPLETED status
  const CellScheduleName = ({ value, row, ...props }: any) => {
    return (
      <div className="row-center cursor-pointer underline-offset-3	 underline" onClick={() => handleScheduleClick(row)}>
        {row.original.data.status === 'COMPLETED' ? <StatusIndicator size="small" color="success" /> : null}
        <span className="font-medium text-neutral-800 ">{value}</span>
      </div>
    );
  };

  // Renderer for dates -- currently, the DB contains the start and end date in nanoseconds and seconds
  const CellDate = ({ value }: any) => {
    return (
      <>
        {formatDate(convertToActualDateTime(value))}
        <br />
        {formatTime(convertToActualDateTime(value))}
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
    progress = progress >= 100 ? 100 : progress < 0 ? 0 : progress;
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
      <div
        className="flex flex-row items-center gap-1"
        onClick={() => {
          if (value === 'INITIALIZED') {
            setFilter({ ...filter, status: 'INITIALIZED' });
          } else if (value === 'LIVE') {
            setFilter({ ...filter, status: 'LIVE' });
          } else if (value === 'WAITING_APPROVAL' || value === 'CREATING' || value === 'CREATED') {
            setFilter({ ...filter, status: 'PENDING' });
          } else if (value === 'WAITING_FUNDS') {
            setFilter({ ...filter, status: 'FUND' });
          }
        }}>
        <Chip {...statuses[value]} size="small" rounded className="cursor-pointer" />
        {row.original.data.archive ? (
          <Chip label="Archived" size="small" rounded color="grayAlt" className="cursor-pointer" />
        ) : null}
      </div>
    );
  };

  // Renderer for more action items
  const CellActions = (props: any) => {
    const { data, id } = props.row.original;
    // This function will help to consolidate the actions that are available in the actions column.
    const actionItems = (recordIndex: number) => {
      const items = [];
      // Check for the status of the vesting schedule if it is live or completed.
      if ((data as IVesting).status === 'COMPLETED' || (data as IVesting).status === 'LIVE') {
        // Completed or Live vesting schedules can be revoked.
        // items.push({ label: 'Revoke', onClick: () => handleRevoke(id, data, recordIndex) });
      } else {
        // Other statuses can be archived.
        items.push({
          label: `${data.archive ? 'Unarchive' : 'Archive'}`,
          onClick: () => handleArchiving(id, data)
        });
      }

      // Check if the vesting schedule is a draft
      const editableStatuses = ['CREATING', 'INITIALIZED', 'WAITING_APPROVAL'];
      if (editableStatuses.includes((data as IVesting).status!)) {
        items.push({ label: 'Edit', onClick: () => editSchedule(id, data) });
        items.push({
          label: 'Delete',
          onClick: () => {
            deleteSchedulePrompt(id, data);
            // Show delete html can be seen in DefaultLayout.tsx
            // while the data is handle in the vestingContext
            setShowDeleteModal(true);
          }
        });
      }

      return items;
    };

    const onScheduleSelect = () => {
      const actualDateTime = getActualDateTime(data.details);
      setSelectedSchedule({
        id,
        data: {
          ...data,
          details: {
            ...data?.details,
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime
          }
        }
      });
    };
    return (
      <table className="-my-3.5 -mx-6">
        <tbody>
          {data.recipients.map((_: IRecipient, rIndex: number) => {
            return (
              <tr key={`recipient-${rIndex}`} className="group">
                <td className="group-last:border-b-0">
                  <div className="py-2 flex items-center flex-nowrap">
                    <button className="primary" onClick={() => onScheduleSelect()}>
                      Quick preview
                    </button>
                    {data.status !== 'LIVE' && <DropdownMenu items={actionItems(rIndex)} />}
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
                  <div className="w-full py-2 text-center">
                    {recipient.address ? (
                      <Copy text={recipient.address}>{minifyAddress(recipient.address)}</Copy>
                    ) : (
                      <span>No Wallet</span>
                    )}
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
        className: status === 'COMPLETED' ? 'bg-success-50' : archive ? 'bg-gray-50' : '',
        stickyActions: true
      };
    }
    return {};
  };

  // Handles the archiving process
  const handleArchiving = async (id: string, data: IVesting) => {
    await VestingScheduleApiService.removeVestingSchedule(id);
    toast.success(`Schedule: ${data.name} archived!`);
    // toast.success(`Schedule: ${data.name} ${!data.archive ? '' : 'un'}archived!`);
    // getVestings(false);
  };

  // Handles revoking process
  // const handleRevoke = async (id: string, data: IVesting, rIndex: number) => {
  //   const signer = library?.getSigner(0);
  //   const vestingAddress = vestingContracts.find((v) => v.id === data.vestingContractId)?.data.address;
  //   if (!signer || !account || !chainId || !vestingAddress) return;

  //   const recipient = recipients.filter((recipient) => recipient.data.vestingId === id)[rIndex].data.walletAddress;
  //   if (data.status === 'COMPLETED' || data.status === 'LIVE') {
  //     setIsCloseAvailable(false);
  //     try {
  //       setTransactionStatus('PENDING');
  //       if (currentSafe?.address) {
  //         const vestingContractInterface = new ethers.utils.Interface([REVOKE_CLAIM_FUNCTION_ABI]);

  //         setTransactionStatus('IN_PROGRESS');
  //         const { hash: safeHash } = await createSafeTransaction(
  //           signer,
  //           chainId as SupportedChainId,
  //           account,
  //           currentSafe.address,
  //           currentSafe?.owners?.map((owner) => owner.address) ?? [],
  //           {
  //             to: vestingAddress,
  //             data: vestingContractInterface.encodeFunctionData('revokeClaim', [recipient]),
  //             value: '0'
  //           }
  //         );

  //         const transactionID = await createTransaction({
  //           hash: '',
  //           safeHash,
  //           chainId: data.chainId,
  //           organizationId: data.organizationId,
  //           vestingIds: [id],
  //           to: vestingAddress,
  //           status: 'PENDING',
  //           createdAt: Math.floor(new Date().getTime() / 1000),
  //           updatedAt: Math.floor(new Date().getTime() / 1000),
  //           type: 'REVOKE_CLAIM'
  //         });

  //         await createRevoking({
  //           vestingId: id,
  //           recipient,
  //           transactionId: transactionID ?? '',
  //           createdAt: Math.floor(new Date().getTime() / 1000),
  //           updatedAt: Math.floor(new Date().getTime() / 1000),
  //           chainId,
  //           organizationId: organizationId!,
  //           status: 'PENDING'
  //         });
  //         toast.success('Revoking transaction is created successfully.');
  //         console.info('Safe Transaction: ', safeHash);
  //       } else {
  //         const vestingContractInstance = new ethers.Contract(
  //           vestingAddress,
  //           VTVL_VESTING_ABI.abi,
  //           library.getSigner()
  //         );
  //         const revokeTransaction = await vestingContractInstance.revokeClaim(recipient);
  //         setTransactionStatus('IN_PROGRESS');
  //         await revokeTransaction.wait();
  //         toast.success('Revoking is done successfully.');
  //       }
  //       setTransactionStatus('SUCCESS');
  //     } catch (err) {
  //       console.log('handleRevoke - ', err);
  //       toast.error('Something went wrong. Try agaiin later.');
  //       setTransactionStatus('ERROR');
  //     }
  //   }
  // };

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
        Cell: ({ row }: any) => {
          const sDateTime = convertToActualDateTime(row.original.data.details.startDateTime);
          const eDateTime = convertToActualDateTime(row.original.data.details.endDateTime);
          return getDuration(sDateTime, eDateTime);
        }
      },
      {
        id: 'totalAllocation',
        Header: 'Total allocation',
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
    [tab, filteredVestingSchedules]
  );

  const MilestoneCellActions = (props: any) => {
    const onMilestoneVestingSelect = async () => {
      setSelectedMilestoneVesting(props.row.original);
      setTimeout(() => {
        // Show the data
        handleScheduleClick(props.row);
      }, 300);
    };
    return (
      <div className="flex items-center justify-end flex-nowrap">
        <button className="primary" onClick={() => onMilestoneVestingSelect()}>
          Quick preview
        </button>
      </div>
    );
  };

  const milestoneTableColumns = useMemo(
    () => [
      {
        id: 'recipient',
        Header: 'Recipient',
        accessor: 'data.recipientName'
      },
      {
        id: 'type',
        Header: 'Type',
        accessor: 'data.type'
      },
      {
        id: 'milestones',
        Header: 'Milestones',
        accessor: 'data.milestones',
        Cell: ({ row }: any) => row.original.data.milestones.length
      },
      {
        id: 'status',
        Header: 'Status',
        accessor: 'data.status'
      },
      {
        id: 'progress',
        Header: 'Progress',
        accessor: 'data',
        Cell: 0
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'actions',
        Cell: MilestoneCellActions
      }
    ],
    [tab, milestoneVestings]
  );

  console.log('Data counts', milestoneVestings);
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
      const vestingContract = vestingContracts.find((v) => v.id === (selectedRows as any)[0].data.vestingContractId);
      setVestingContract(vestingContract);
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
          vesting.details.startDateTime && vesting.details.cliffDuration !== 'no_cliff'
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
          vesting.details.cliffDuration !== 'no_cliff'
            ? cliffReleaseDate
            : new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis());
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
        const actualDates = getActualDateTime(vesting.details);
        const releaseFrequencyTimestamp = getReleaseFrequencyTimestamp(
          actualDates.startDateTime!,
          actualDates.endDateTime!,
          vesting.details.releaseFrequency,
          vesting.details.cliffDuration
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

      vestingEndTimestamps = vestingEndTimestamps.map((endTimeStamp: number, index: number) => {
        if ((endTimeStamp - vestingStartTimestamps[index]) % vestingReleaseIntervals[index] !== 0) {
          const times = Math.floor(endTimeStamp / vestingReleaseIntervals[index]);
          return vestingStartTimestamps[index] + vestingReleaseIntervals[index] * (times + 1);
        }
        return endTimeStamp;
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

      if (currentSafe?.address && account && chainId && organizationId) {
        const VestingContract = new ethers.Contract(
          vestingContract?.address ?? '',
          VESTING_ABI.abi,
          ethers.getDefaultProvider(SupportedChains[chainId].rpc)
        );
        const isAdmin = await VestingContract.isAdmin(currentSafe?.address);

        if (!isAdmin) {
          toast.error(
            "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
          );
          setTransactionStatus('ERROR');
          return;
        }

        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const nextNonce = await safeService.getNextNonce(currentSafe.address);

        const txData = {
          to: vestingContract?.address ?? '',
          data: createClaimsBatchEncoded,
          value: '0',
          nonce: nextNonce
        };
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
        const txHash = await safeSdk.getTransactionHash(safeTransaction);
        const signature = await safeSdk.signTransactionHash(txHash);
        setTransactionStatus('IN_PROGRESS');
        safeTransaction.addSignature(signature);

        await safeService.proposeTransaction({
          safeAddress: currentSafe.address,
          senderAddress: account,
          safeTransactionData: safeTransaction.data,
          safeTxHash: txHash,
          senderSignature: signature.data
        });

        if (account && organizationId) {
          const transaction = await TransactionApiService.createTransaction({
            hash: '',
            safeHash: txHash,
            status: 'PENDING',
            to: vestingContract?.address ?? '',
            type: 'ADDING_CLAIMS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId,
            chainId,
            vestingIds
          });
          updateTransactions(transaction);
          await Promise.all(
            selectedRows.map(async (row: any) => {
              const vestingId = row.id;
              const vesting = row.data;
              await VestingScheduleApiService.updateVestingSchedule(
                {
                  ...vesting,
                  status: 'WAITING_APPROVAL',
                  transactionId: transaction.id
                },
                vestingId
              );
            })
          );

          toast.success(`Created a transaction with nonce ${nextNonce} successfully`);
          await fetchDashboardData();
        }
        toast.success('Transaction has been created successfully.');
        setTransactionStatus('SUCCESS');
      } else if (account && chainId && organizationId) {
        const VestingContract = new ethers.Contract(
          vestingContract?.address ?? '',
          VESTING_ABI.abi,
          ethers.getDefaultProvider(SupportedChains[chainId].rpc)
        );
        const isAdmin = await VestingContract.isAdmin(account);

        if (!isAdmin) {
          toast.error(
            "You don't have enough privilege to run this transaction. Please select correct Multisig or Metamask account."
          );
          return;
        }

        setTransactionStatus('PENDING');
        const vestingContractInstance = new ethers.Contract(
          vestingContract?.address ?? '',
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
        const transactionData: ITransactionRequest = {
          hash: addingClaimsTransaction.hash,
          safeHash: '',
          status: 'PENDING',
          to: vestingContract?.address ?? '',
          type: 'ADDING_CLAIMS',
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId,
          chainId,
          vestingIds
        };
        const transaction = await TransactionApiService.createTransaction(transactionData);
        updateTransactions(transaction);
        await Promise.all(
          selectedRows.map(async (row: any) => {
            const vestingId = row.id;
            const vesting = row.data;
            await VestingScheduleApiService.updateVestingSchedule(
              {
                ...vesting,
                status: 'WAITING_APPROVAL',
                transactionId: transaction.id
              },
              vestingId
            );
          })
        );
        setTransactionStatus('IN_PROGRESS');
        await addingClaimsTransaction.wait();
        const t = await TransactionApiService.updateTransaction(transaction.id, {
          status: 'SUCCESS',
          updatedAt: Math.floor(new Date().getTime() / 1000)
        });
        updateTransactions(t);
        await Promise.all(
          selectedRows.map(async (row: any) => {
            const vestingId = row.id;
            const vesting = row.data;
            await VestingScheduleApiService.updateVestingSchedule(
              {
                ...vesting,
                status: 'LIVE',
                transactionId: t.id
              },
              vestingId
            );
          })
        );
        toast.success('Added schedules successfully.', { toastId: TOAST_IDS.SUCCESS });
        setTransactionStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleBatchProcess - ', err);
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
    if (totalUsedSupply && mintFormState.totalSupply) {
      setRemaining(+mintFormState.totalSupply - totalUsedSupply);
    }
  }, [totalUsedSupply, mintFormState.totalSupply]);

  return (
    <>
      {vestingSchedules?.length && mintFormState ? (
        <>
          <div className="w-full h-full mb-1 px-6">
            <div className="flex flex-row items-center justify-between mb-2">
              <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
                Schedules
              </Typography>
              <div className="flex flex-row items-center justify-start gap-2">
                <button className="primary row-center" onClick={() => setShowVestingSelectModal(true)}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="whitespace-nowrap">Create</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-4">
              <div>
                <TokenProfile
                  name={mintFormState.name}
                  address={mintFormState.address}
                  logo={mintFormState.logo}
                  size="small"
                />
                {/* <Copy text={mintFormState.address}>
                  <p className="text-sm font-medium text-netural-900">
                    Token address: <span className="text-neutral-500">{mintFormState.address}</span>
                  </p>
                </Copy> */}
              </div>
            </div>
            <BarRadio name="vesting-tabs" variant="tab" value={tab} options={vestingTabs} onChange={handleTabChange} />
          </div>
          <div className="w-full p-6 bg-gray-50 border-t border-gray-200">
            <div className="w-full">
              <ContractsProfile
                vestingContractsInfo={vestingContractsInfo}
                count={vestingSchedules.length}
                title="Schedules"
                showUnallocated={false}
              />
            </div>
            <div className="w-full my-5">
              <VestingScheduleFilter filter={filter} updateFilter={setFilter} />
            </div>
            {tab === 'time-based' ? (
              <Table
                columns={columns}
                data={filteredVestingSchedules}
                getTrProps={getTrProps}
                selectable
                pagination
                batchOptions={{
                  label: 'Batch transactions',
                  onBatchProcessClick: handleBatchProcess
                }}
              />
            ) : tab === 'milestone-based' ? (
              <Table columns={milestoneTableColumns} data={milestoneVestings} selectable pagination />
            ) : null}
            {open ? (
              <Drawer>
                <MilestoneVesting
                  name="ISS-0132"
                  allocations={allocations}
                  milestones={milestones}
                  totalAllocation="400,000"
                  totalDuration="1 year 6 months"
                  totalRecipients={4}
                  onClose={hideDrawer}
                  actions={
                    <>
                      <Button className="primary block mx-auto mb-3" onClick={hideDrawer}>
                        View Full Details
                      </Button>
                    </>
                  }
                />
              </Drawer>
            ) : null}
          </div>
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
      <PromptModal isOpen={!!selectedSchedule} hideModal={() => setSelectedSchedule(undefined)}>
        <div className="panel max-w-2xl w-full">
          {selectedSchedule && (
            <VestingSummary
              vestingSchedule={selectedSchedule}
              symbol={mintFormState.symbol}
              safe={currentSafe}
              recipients={recipients}
            />
          )}
          <div className="flex justify-between ">
            <Button label="Close" onClick={() => setSelectedSchedule(undefined)} />

            <Button
              className="primary"
              label="View all details"
              onClick={() => router.push(`/vesting-schedule/${selectedSchedule?.id}`)}
            />
          </div>
        </div>
      </PromptModal>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
VestingScheduleProject.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [{ title: 'Vesting schedule', route: '/vesting-schedule' }];
  return (
    <SteppedLayout title="Vesting schedule" crumbs={crumbSteps} padded={false}>
      {page}
    </SteppedLayout>
  );
};

export default VestingScheduleProject;
