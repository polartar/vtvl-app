import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import VestingProgress from '@components/atoms/VestingProgress/VestingProgress';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { fetchToken, fetchTokensByQuery } from 'services/db/token';
import { fetchVestingContractByQuery } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IToken, IVesting } from 'types/models';
import { formatDate, formatTime } from 'utils/shared';
import { formatNumber } from 'utils/token';

import TokenProfile from '../TokenProfile/TokenProfile';

export interface IMyTokenDetails {
  token: IToken;
  vesting: IVesting;
}

const MyTokenDetails: React.FC<IMyTokenDetails> = ({ token, vesting }) => {
  const { library, chainId, account, activate } = useWeb3React();
  const { setTransactionStatus } = useTransactionLoaderContext();

  const [totalVested, setTotalVested] = useState('');
  const [claimable, setClaimable] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [vestingContractAddress, setVestingContractAddress] = useState('');

  const importToken = async () => {
    try {
      if (!library || !token) return;
      await library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: token?.address,
            symbol: token?.symbol,
            decimals: token?.decimals || 18,
            image: token?.logo
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaim = async () => {
    if (!account || !library || !chainId) {
      activate(injected);
      return;
    }
    if (vestingContractAddress) {
      const vestingContract = new ethers.Contract(vestingContractAddress, VTVL_VESTING_ABI.abi, library.getSigner());
      setTransactionStatus('PENDING');
      try {
        const withdrawTx = await vestingContract.withdraw();
        setTransactionStatus('IN_PROGRESS');
        await withdrawTx.wait();
        setTransactionStatus('SUCCESS');
        setClaimable('0');
      } catch (err) {
        console.log('handleClaim - ', err);
        setTransactionStatus('ERROR');
      }
    }
  };

  useEffect(() => {
    if (vesting.organizationId && account && chainId) {
      setDaysLeft(
        Math.floor(
          (new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const daysPassed =
        (new Date().getTime() -
          new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()).getTime()) /
        (1000 * 60 * 60 * 24);
      setProgress(Math.floor(daysPassed / (daysLeft + daysPassed)));
      fetchVestingContractByQuery('organizationId', '==', vesting.organizationId).then((res) => {
        if (res?.data) {
          setVestingContractAddress(res.data.address);
          const vestingContract = new ethers.Contract(
            res?.data?.address ?? '',
            VTVL_VESTING_ABI.abi,
            ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
          );
          vestingContract.numTokensReservedForVesting().then((res: string) => setTotalVested(res));
          vestingContract.claimableAmount(account).then((res: string) => setClaimable(res));
        }
      });
    }
  }, [vesting, token, chainId, account]);

  return (
    <div className="panel p-0">
      <div className="p-6">
        <div className="row-center justify-between gap-3 mb-4">
          <TokenProfile logo={token?.logo} name={token?.name} symbol={token?.symbol} size="small" />
          <Chip label={vesting.name || ''} color="gray" rounded />
        </div>
        <div className="row-center gap-2 text-xxs text-neutral-500 mb-3">
          <Copy text={token?.address || ''}>
            <p>{token?.address}</p>
          </Copy>
        </div>
        <button onClick={() => importToken()} className="secondary py-1 mb-6">
          Import token to your wallet
        </button>
        <VestingProgress duration={`${daysLeft} days left`} progress={progress} />
        <div className="mt-6 grid grid-cols-2 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Your total allocation</p>
            <p className="text-sm font-semibold text-neutral-600">
              {formatNumber(vesting.details.amountToBeVested / vesting.recipients.length || 0)} {token?.symbol}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Total vested</p>
            <p className="text-sm font-semibold text-neutral-600">
              {claimable ? formatNumber(+totalVested / 10 ** 18, 0) : 0} {token?.symbol}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 py-4 border-b border-gray-200">
          {/* <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Claimed</p>
            <p className="text-sm font-semibold text-neutral-600">
              {claimable ? formatNumber(+claimable, 0) : 0} {token?.symbol}
            </p>
          </div> */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Claimable</p>
            <p className="text-sm font-semibold text-neutral-600">
              {claimable ? formatNumber(+claimable / 10 ** 18, 0) : 0} {token?.symbol}
            </p>
          </div>
          {/* <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Next unlock</p>
            <div className="text-sm font-semibold text-neutral-600">
              <Countdown
                date={Date.now() + 10000}
                renderer={({ days, hours, minutes, seconds }) => (
                  <>
                    {days}d {hours}h {minutes}m {seconds}s
                  </>
                )}
              />
            </div>
          </div> */}
        </div>
        <div className="grid grid-cols-2 mt-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Start</p>
            <p className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
              <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
              <>
                {formatDate(new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()) || new Date())}
                <br />
                {formatTime(new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()) || new Date())}
              </>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">End</p>
            <p className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
              <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
              <>
                {formatDate(new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()) || new Date())}
                <br />
                {formatTime(new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()) || new Date())}
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
            disabled={!claimable || !account || !chainId || !library}
            onClick={handleClaim}>
            Claim{' '}
            <strong>
              {claimable ? formatNumber(+claimable / 10 ** 18, 0) : 0} {token?.symbol}
            </strong>
          </button>
          {/* Temporarily removed -- will update again later */}
          {/* <Link href={viewDetailsUrl}>
            <span className="flex w-full items-center justify-center h-10 text-primary-900 text-sm font-medium cursor-pointer">
              View details
            </span>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default MyTokenDetails;
