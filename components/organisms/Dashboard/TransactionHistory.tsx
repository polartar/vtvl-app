import Chip from '@components/atoms/Chip/Chip';
import { Typography } from '@components/atoms/Typography/Typography';
import { twMerge } from 'tailwind-merge';

const DashboardTransactionHistory = () => {
  const rowDefaultClass = 'flex items-center h-16 py-2.5 px-6 flex-shrink-0 border-b border-primary-200';

  return (
    <div className="flex flex-col justify-between min-h-[200px] border border-neutral-300 rounded-xl overflow-hidden">
      <div className=" w-full max-h-[700px] overflow-y-auto">
        <div className="flex bg-neutral-100 text-neutral-600 text-caption font-medium">
          <div className="w-24 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Date</div>
          <div className="w-24 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Type</div>
          <div className="w-32 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Tokens</div>
          <div className="w-28 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">From</div>
          <div className="w-28 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">To</div>
          <div className="w-28 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">USD</div>
          <div className="w-20 py-2.5 px-6 flex-shrink-0 border-b border-primary-200 bg-neutral-100">Tx</div>
        </div>
        <div className="flex items-center text-neutral-600 text-xs">
          <div className={twMerge('w-24 text-neutral-500', rowDefaultClass)}>
            <div className="flex flex-col">
              <span>12/06/23</span>
              <span>22:30:00</span>
            </div>
          </div>
          <div className={twMerge('w-24', rowDefaultClass)}>
            <Chip label="Withdraw" color="warningAlt" />
          </div>
          <div className={twMerge('w-32 text-neutral-500', rowDefaultClass)}>15,000</div>
          <div className={twMerge('w-28', rowDefaultClass)}>Tech Team</div>
          <div className={twMerge('w-28', rowDefaultClass)}>Dexter L.</div>
          <div className={twMerge('w-28', rowDefaultClass)}>$7,405</div>
          <div className={twMerge('w-20', rowDefaultClass)}>
            <img src="/images/etherscan.png" className="flex-shrink-0 h-6 w-6" alt="Etherscan" />
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

export default DashboardTransactionHistory;
