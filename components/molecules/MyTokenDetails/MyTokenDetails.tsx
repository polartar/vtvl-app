import Chip from '@components/atoms/Chip/Chip';
import VestingProgress from '@components/atoms/VestingProgress/VestingProgress';
import Link from 'next/link';
import CopyIcon from 'public/icons/copy-to-clipboard.svg';
import Countdown from 'react-countdown';
import { formatDate, formatTime } from 'utils/shared';
import { formatNumber } from 'utils/token';

import TokenProfile from '../TokenProfile/TokenProfile';

export interface ITokenDetails {
  name: string;
  symbol?: string;
  logo: string;
  address: string;
}

export interface IVestingInfo {
  name: string;
  totalAllocation: number;
  totalVested: number;
  claimed: number;
  unclaimed: number;
  startDateTime: Date;
  endDateTime: Date;
}

export interface IClaimable {
  token: number;
  isClaimable: boolean;
}

export interface IMyTokenDetails {
  token: ITokenDetails;
  vesting?: IVestingInfo;
  claimable?: IClaimable;
  viewDetailsUrl?: string;
  onClaim?: () => void;
}

const MyTokenDetails = ({ viewDetailsUrl = '', onClaim = () => {}, ...props }: IMyTokenDetails) => {
  return (
    <div className="panel p-0">
      <div className="p-6">
        <div className="row-center justify-between gap-3 mb-4">
          <TokenProfile logo={props.token.logo} name={props.token.name} symbol={props.token.symbol} size="small" />
          <Chip label={props?.vesting?.name || ''} color="gray" rounded />
        </div>
        <div className="row-center gap-2 text-xxs text-neutral-500 mb-3">
          <CopyIcon className="fill-current h-4 cursor-pointer" />
          <p>{props.token.address}</p>
        </div>
        <button className="secondary py-1 mb-6">Import token to your wallet</button>
        <VestingProgress duration="30 days left" progress={50} />
        <div className="mt-6 grid grid-cols-2 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Your total allocation</p>
            <p className="text-sm font-semibold text-neutral-600">
              {formatNumber(props?.vesting?.totalAllocation || 0)} {props.token.symbol}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Total vested</p>
            <p className="text-sm font-semibold text-neutral-600">
              {formatNumber(props?.vesting?.totalVested || 0)} {props.token.symbol}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Claimed</p>
            <p className="text-sm font-semibold text-neutral-600">
              {formatNumber(props?.vesting?.claimed || 0)} {props.token.symbol}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Unclaimed</p>
            <p className="text-sm font-semibold text-neutral-600">
              {formatNumber(props?.vesting?.unclaimed || 0)} {props.token.symbol}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Next unlock</p>
            <div className="text-sm font-semibold text-neutral-600">
              {/*
                Add the current date here plus the end date time of the vesting schedule 
                OR probably be the date time of the next linear release
                all in milliseconds
              */}
              <Countdown
                date={Date.now() + 10000}
                renderer={({ days, hours, minutes, seconds }) => (
                  <>
                    {days}d {hours}h {minutes}m {seconds}s
                  </>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 mt-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Start</p>
            <p className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
              <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
              <>
                {formatDate(props?.vesting?.startDateTime || new Date())}
                <br />
                {formatTime(props?.vesting?.startDateTime || new Date())}
              </>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">End</p>
            <p className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
              <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
              <>
                {formatDate(props?.vesting?.endDateTime || new Date())}
                <br />
                {formatTime(props?.vesting?.endDateTime || new Date())}
              </>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="px-6 pb-2">
          <button
            type="button"
            className="primary w-full mb-2"
            disabled={!props?.claimable?.isClaimable || false}
            onClick={onClaim}>
            Claim <strong>{formatNumber(props?.claimable?.token || 0)}</strong> {props.token.symbol}
          </button>
          <Link href={viewDetailsUrl}>
            <span className="flex w-full items-center justify-center h-10 text-primary-900 text-sm font-medium cursor-pointer">
              View details
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyTokenDetails;
