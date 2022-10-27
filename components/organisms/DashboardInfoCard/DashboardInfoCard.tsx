import EmptyState from '@components/atoms/EmptyState/EmptyState';
import Router from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import { CommonLabelType } from 'types/shared';

interface IDashboardScheduleProps {
  icon?: string;
  title: string;
  description: CommonLabelType;
  emptyTitle: string;
  emptyImage?: string;
  emptyDescription: CommonLabelType;
  url?: string;
}

const DashboardInfoCard = (props: IDashboardScheduleProps) => {
  return (
    <div className="panel">
      {props.icon ? <img src={props.icon} className="w-5 h-5 mb-2.5" /> : null}
      <h3 className="h5 font-semibold text-neutral-900 inter">{props.title}</h3>
      <p className="paragraphy-small-medium text-neutral-500 mb-12">{props.description}</p>
      <div className="px-10">
        <EmptyState
          title={props.emptyTitle}
          description={props.emptyDescription}
          image={props.emptyImage}
          imageBlend={false}
        />
      </div>
      {props.url ? (
        <div className="border-t border-gray-200 pt-4">
          <button className="primary line row-center" onClick={() => (props.url ? Router.push(props.url) : {})}>
            <PlusIcon className="w-5 h-5 stroke-current" />
            Full details
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardInfoCard;
