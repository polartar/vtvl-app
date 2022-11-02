import Chip from '@components/atoms/Chip/Chip';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import ContractOverview from '@components/molecules/ContractOverview/ContractOverview';
import ScheduleOverview from '@components/molecules/ScheduleOverview/ScheduleOverview';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import { IScheduleOverviewProps, IVestingContractProps } from 'types/models/vesting';

interface IDashboardPanelProps {
  type: 'schedule' | 'contract';
  status:
    | 'authRequired'
    | 'vestingContractRequired'
    | 'linkToSafe'
    | 'fundingRequired'
    | 'fundingInProgress'
    | 'approved'
    | 'declined';
  schedule?: IScheduleOverviewProps;
  contract?: IVestingContractProps;
  step?: number;
  className?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

interface IDashboardPanelStatuses {
  icon: string | JSX.Element | React.ReactNode;
  label: string;
  actions?: JSX.Element | React.ReactNode;
}

/**
 * Dashboard Panel component caters two types of item
 * 1. Contract - displays an overview details of the contract
 * 2. Schedule - displays an overview details of the schedule
 * Each type display different heading portion (status) and actions (buttons)
 *
 * Statuses:
 * - authRequired - has confirmation steps - based on number of approvals
 * - vestingContractRequired
 * - linkToSafe
 * - fundingRequired
 * - fundingInProgress - has confirmation steps - based on number of approvals
 * - approved
 * - declined
 *
 * onPrimaryClick - is an event when triggering the primary CTA for the panel
 * onSecondaryClick - is an event when triggering the secondary CTA -- normally "View details" etc.
 *
 */

const DashboardPanel = ({
  type = 'schedule',
  status,
  schedule,
  contract,
  className,
  step = 0,
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
  ...props
}: IDashboardPanelProps) => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip
  const statuses: Record<string, IDashboardPanelStatuses> = {
    authRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Authorization required',
      actions: (
        <>
          <button className="secondary" onClick={onPrimaryClick}>
            Sign and authorize
          </button>
          <button className="line primary" onClick={onSecondaryClick}>
            View details
          </button>
        </>
      )
    },
    vestingContractRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Vesting contract required',
      actions: (
        <>
          <button className="secondary" onClick={onPrimaryClick}>
            Create vesting contract
          </button>
        </>
      )
    },
    linkToSafe: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Safe',
      actions: (
        <>
          <button className="line primary" disabled onClick={onPrimaryClick}>
            Create vesting contract
          </button>
          <button className="black row-center" onClick={onSecondaryClick}>
            <img src="/images/multi-sig.png" className="w-6 h-6" aria-hidden="true" />
            Transfer ownership to multi-sig Safe
          </button>
        </>
      )
    },
    fundingRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding required',
      actions: (
        <>
          <button className="secondary" onClick={onPrimaryClick}>
            Fund contract
          </button>
          <button className="line primary" onClick={onSecondaryClick}>
            View details
          </button>
        </>
      )
    },
    fundingInProgress: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding in progress',
      actions: (
        <>
          <button className="primary" disabled>
            Funding contract pending
          </button>
          <button className="line primary" onClick={onSecondaryClick}>
            View details
          </button>
        </>
      )
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

  const steps = [
    { title: '', desc: '' },
    { title: '', desc: '' },
    { title: '', desc: '' }
  ];

  return (
    <div className={`panel ${className}`}>
      <div className="row-center justify-between border-b border-gray-200 mb-3 pb-3">
        <Chip
          label={
            <p className="row-center">
              {statuses[status].icon}
              {statuses[status].label}
            </p>
          }
          color={status === 'approved' ? 'success' : status === 'declined' ? 'danger' : 'warning'}
          rounded
        />
        {status === 'authRequired' || status === 'fundingInProgress' ? (
          <div className="row-center gap-1 paragraphy-small-medium text-neutral-500">
            <div>
              Confirmation status <span className="text-secondary-900">{step - 1}</span>/{steps.length}
            </div>
            <StepWizard status={step - 1} steps={steps} size="tiny" />
          </div>
        ) : null}
      </div>
      <div>
        {type === 'schedule' && schedule ? <ScheduleOverview {...schedule} /> : null}
        {type === 'contract' && contract ? <ContractOverview {...contract} /> : null}
      </div>
      <div className="border-t mt-3 pt-3 row-center justify-between">
        <div className="row-center">{statuses[status].actions}</div>
      </div>
    </div>
  );
};

export default DashboardPanel;
