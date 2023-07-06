import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import Router from 'next/router';
import RecipientsIcon from 'public/icons/cap-table-recipients.svg';
import SchedulesIcon from 'public/icons/cap-table-schedules.svg';
import PlusIcon from 'public/icons/plus.svg';
import { convertToUSD } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

interface CapTableOverviewProps {
  token: string;
  url?: string;
  claimed: number | Decimal | ethers.BigNumber;
  schedules: number;
  unclaimed: number | Decimal | ethers.BigNumber;
  totalRecipients: number;
  totalAllocation: number | Decimal | ethers.BigNumber;
}

const CapTableOverview = ({
  token,
  url = '',
  schedules,
  totalRecipients,
  claimed,
  unclaimed,
  totalAllocation
}: CapTableOverviewProps) => {
  // Create a function here that converts the token amounts into currency ie., USD ($) etc.
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Schedules</p>
          <div className="flex flex-row items-center gap-2 paragraphy-large-semibold text-neutral-900">
            <SchedulesIcon className="w-6 h-6" />
            {schedules}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Total recipients</p>
          <div className="flex flex-row items-center gap-2 paragraphy-large-semibold text-neutral-900">
            <RecipientsIcon className="w-6 h-6" />
            {totalRecipients}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Withdrawn</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <p className="mb-2">
              {formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(claimed))))} {token}
            </p>
            {/* <div className="paragraphy-small-semibold text-success-500">= ${convertToUSD(claimed)}</div> */}
          </div>
        </div>
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Unclaimed</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <p className="mb-2">
              {formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(unclaimed))))} {token}
            </p>
            {/* <div className="paragraphy-small-semibold text-success-500">= ${convertToUSD(unclaimed)}</div> */}
          </div>
        </div>
        {/* <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Total withdrawn</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <p className="mb-2">
              {formatNumber(+totalWithdrawn.toString())} {token}
            </p>
            <div className="paragraphy-small-semibold text-success-500">= ${convertToUSD(totalWithdrawn)}</div>
          </div>
        </div> */}
        <div>
          <p className="paragraphy-tiny-medium neutral-text mb-6">Total allocation</p>
          <div className="paragraphy-large-semibold text-neutral-900">
            <p className="mb-2">
              {formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(totalAllocation))))} {token}
            </p>
            {/* <div className="paragraphy-small-semibold text-success-500">= ${convertToUSD(totalAllocation)}</div> */}
          </div>
        </div>
      </div>
      {url ? (
        <button
          className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-2 py-1 row-center"
          onClick={() => Router.push(url)}>
          Learn more <PlusIcon className="w-3 h-3" />
        </button>
      ) : null}
    </>
  );
};

export default CapTableOverview;
