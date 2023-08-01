import { useAuthContext } from '@providers/auth.context';
import { truncateLabel } from '@utils/shared';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import Fade from 'react-reveal/Fade';
import { ISafe } from 'types/models';

interface SafeItemProps {
  safe?: { id: string; data: ISafe };
}

const SafeItem = ({ safe }: SafeItemProps) => {
  return safe ? (
    <>
      <img className="w-6 h-6 rounded-full" src="/icons/safe_wallet.svg" />
      <div className="">
        {safe.data?.safe_name ? (
          <div className="text-xxs leading-tight">{truncateLabel(safe.data?.safe_name, 20, true)}</div>
        ) : null}
        <div className="text-sm leading-tight font-medium">{truncateLabel(safe.data?.address, 11, true)}</div>
      </div>
    </>
  ) : (
    <>
      <img className="w-6 h-6 rounded-full" src="/icons/safe_wallet.svg" />
      <p className="text-sm font-medium">
        <span className="hidden sm:block lg:hidden">No Safe</span>
        <span className="hidden lg:block">No Safe</span>
      </p>
    </>
  );
};

const SafeSelector = () => {
  const { active } = useWeb3React();
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
          <SafeItem safe={currentSafe ? { id: 'selected-one', data: currentSafe } : undefined} />
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
          <div className="absolute z-10 top-12 flex flex-col bg-gray-50 border border-gray-200 rounded-3xl w-full py-1 px-2 sm:px-3 gap-1">
            {safes.map((safe) => (
              <div
                key={safe.id}
                className={`h-10 px-2 flex flex-row items-center sm:gap-2 cursor-pointer transition-all rounded-8 hover:translate-x-1 ${
                  safe.id === currentSafeId
                    ? 'bg-primary-900 text-white'
                    : 'text-primary-900 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={async () => {
                  setCurrentSafe({ ...safe.data });
                  setCurrentSafeId(safe.id);
                  setShowSafes(false);
                }}>
                <SafeItem safe={safe} />
              </div>
            ))}
            <div
              className={`h-10 px-2 flex flex-row items-center sm:gap-2 cursor-pointer transition-all rounded-8 hover:translate-x-1 ${
                !currentSafe ? 'bg-primary-900 text-white' : 'text-primary-900 hover:bg-primary-900 hover:text-white'
              }`}
              onClick={async () => {
                setCurrentSafe(undefined);
                setShowSafes(false);
              }}>
              <SafeItem />
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
};

export default SafeSelector;
