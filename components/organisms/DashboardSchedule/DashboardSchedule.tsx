import Chip from '@components/atoms/Chip/Chip';
import ScheduleOverview from '@components/molecules/ScheduleOverview/ScheduleOverview';
import Router from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import { IScheduleOverviewProps } from 'types/models/vesting';

interface IDashboardScheduleProps extends IScheduleOverviewProps {
  status?: 'approvalNeeded' | 'declined' | 'approved';
  detailUrl?: string;
}

const DashboardSchedule = (props: IDashboardScheduleProps) => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip
  const statuses = {
    approvalNeeded: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Approval needed'
    },
    approved: {
      icon: <SuccessIcon className="w-4 h-4" />,
      label: 'Approved'
    },
    declined: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Declined'
    }
  };
  return (
    <>
      {props.status ? (
        <div className="row-center justify-between mb-5">
          <Chip
            label={
              <p className="row-center">
                {statuses[props.status].icon}
                {statuses[props.status].label}
              </p>
            }
            color={props.status === 'approvalNeeded' ? 'warning' : props.status === 'approved' ? 'success' : 'danger'}
            rounded
          />
        </div>
      ) : null}
      <ScheduleOverview
        name={props.name}
        beneficiaries={props.beneficiaries}
        startDate={props.startDate}
        endDate={props.endDate}
        cliff={props.cliff}
        linearRelease={props.linearRelease}
        totalAllocated={props.totalAllocated}
      />
      {props.detailUrl ? (
        <div className="border-t border-gray-200 pt-5 mt-5">
          <button className="primary row-center" onClick={() => (props.detailUrl ? Router.push(props.detailUrl) : {})}>
            <PlusIcon className="w-5 h-5" />
            View details
          </button>
        </div>
      ) : null}
    </>
  );
};

export default DashboardSchedule;
