import StepProgress from '@components/atoms/StepProgress/StepProgress';
import { Typography } from '@components/atoms/Typography/Typography';
import { twMerge } from 'tailwind-merge';

const DashboardMyTask = () => {
  const rowDefaultClass = 'flex items-center h-16 py-2.5 px-6 flex-shrink-0 border-b border-primary-200';

  return (
    <div className="flex flex-col justify-between min-h-[200px] border border-primary-200 rounded-xl overflow-hidden">
      <div className=" w-full max-h-[700px] overflow-y-auto">
        <div className="flex bg-neutral-100 text-neutral-600 text-caption font-medium">
          <div className="w-36 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Schedules</div>
          <div className="w-28 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Type</div>
          <div className="w-64 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Status</div>
          <div className="w-56 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100"></div>
        </div>
        <div className="flex items-center text-neutral-600 text-xs">
          <div className={twMerge('w-36', rowDefaultClass)}>Marketing Team</div>
          <div className={twMerge('w-28', rowDefaultClass)}>
            <div className="inline-flex bg-neutral-200 px-2 py-1 rounded-md">Milestone</div>
          </div>
          <div className={twMerge('w-64', rowDefaultClass)}>
            <div className="text-neutral-500 flex flex-col gap-1">
              <StepProgress value={3} steps={5} />
              <div className="flex flex-row items-center gap-1">
                <Typography size="small" className="font-semibold leading-none">
                  Next task
                </Typography>
                <Typography size="small" className="leading-none">
                  : Approve milestone 2
                </Typography>
              </div>
            </div>
          </div>
          <div className={twMerge('w-56', rowDefaultClass)}>
            <div className="flex flex-row items-center gap-1">
              <button className="primary small whitespace-nowrap" onClick={() => {}}>
                Confirm
              </button>
              <button className="primary line small whitespace-nowrap" onClick={() => {}}>
                View details
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-6 py-2.5">
        <div>
          <Typography size="caption" className="text-neutral-700">
            Page 1 of 1
          </Typography>
        </div>
        <div className="flex items-center gap-1">
          <button className="line tiny whitespace-nowrap" onClick={() => {}}>
            Previous
          </button>
          <button className="line tiny whitespace-nowrap" onClick={() => {}}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMyTask;
