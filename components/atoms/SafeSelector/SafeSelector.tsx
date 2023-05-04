import { useAuthContext } from '@providers/auth.context';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import Fade from 'react-reveal/Fade';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { toHex } from 'utils/web3';

const SafeSelector = () => {
  const { library, account, active, chainId } = useWeb3React();
  const { currentSafe, setCurrentSafe, safes, currentSafeId, setCurrentSafeId } = useAuthContext();
  const [showSafes, setShowSafes] = useState(false);

  useEffect(() => {
    if (!active) setShowSafes(false);
  }, [active]);

  return (
    <div className="relative sm:w-32 lg:w-44 shrink-0" tabIndex={0} onBlur={() => setShowSafes(false)}>
      <div
        className="flex flex-row items-center justify-between cursor-pointer sm:gap-1 md:gap-3 bg-gray-50 border border-gray-200 rounded-3xl px-2 sm:px-3"
        onClick={() => setShowSafes(!showSafes)}>
        <div className="h-10 shrink-0 grow flex flex-row items-center sm:gap-2 cursor-pointer">
          <img src="/icons/safe_wallet.svg" className="shrink-0 w-6 h-6 rounded-full" alt="VTVL" />
          <p className="text-sm text-primary-900 font-medium">
            <span className="hidden sm:block lg:hidden">
              {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
            </span>
            <span className="hidden lg:block">
              {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
            </span>
          </p>
        </div>
        <img
          src="/chevron-down.svg"
          alt="More"
          className="hidden sm:block sm:h-4"
          style={{
            rotate: showSafes ? '180deg' : '0deg',
            transition: 'all 0.2s ease'
          }}
        />
      </div>
      {showSafes && (
        <Fade cascade bottom>
          <div className="absolute z-10 top-12 flex flex-col bg-gray-50 border border-gray-200 rounded-3xl w-full py-1 px-2 sm:px-3">
            {safes.map((safe, idx: number) => (
              <div
                key={safe.id}
                className={`h-10 px-2 flex flex-row items-center sm:gap-2 cursor-pointer transition-all hover:translate-x-1 ${
                  safe.id === currentSafeId ? 'bg-primary-900 text-white rounded-8' : 'text-primary-900'
                }`}
                onClick={async () => {
                  setCurrentSafe({ ...safe.data });
                  setCurrentSafeId(safe.id);
                  setShowSafes(false);
                }}>
                <img className="w-6 h-6 rounded-full" src="/icons/safe_wallet.svg" />
                <p className="text-sm font-medium">
                  <span className="hidden sm:block lg:hidden">
                    {safe.data?.safe_name}&nbsp;{safe.data?.address.slice(0, 4)}...{safe.data?.address.slice(-4)}
                  </span>
                  <span className="hidden lg:block">
                    {safe.data?.safe_name}&nbsp;{safe.data?.address.slice(0, 4)}...{safe.data?.address.slice(-4)}
                  </span>
                </p>
              </div>
            ))}
            <div
              className={`h-10 px-2 flex flex-row items-center sm:gap-2 cursor-pointer transition-all hover:translate-x-1 ${
                !currentSafe ? 'bg-primary-900 text-white rounded-8' : 'text-primary-900'
              }`}
              onClick={async () => {
                setCurrentSafe(undefined);
                setShowSafes(false);
              }}>
              <img className="w-6 h-6 rounded-full" src="/icons/safe_wallet.svg" />
              <p className="text-sm font-medium">
                <span className="hidden sm:block lg:hidden">No Safe</span>
                <span className="hidden lg:block">No Safe</span>
              </p>
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
};

export default SafeSelector;
