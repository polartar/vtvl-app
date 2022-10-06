import avatar from '@assets/avatar.svg';
import wallet from '@assets/wallet.svg';
import React from 'react';

interface Props {
  connected?: boolean;
}

export const WalletConnect = ({ connected = true }: Props) => {
  return (
    <div className="h-10 shrink-0 flex flex-row items-center gap-2 bg-primary-900 rounded-3xl px-2 sm:px-3 text-gray-50 font-semibold text-sm cursor-pointer transition-all hover:brightness-125">
      <img src={wallet} className={`w-5 ${connected ? 'hidden md:block' : ''}`} alt="e-wallet" />
      {connected ? (
        <>
          <p className="hidden lg:inline">0x1abc...123a</p>
          <img className="w-6" src={avatar} alt="More" />
        </>
      ) : (
        <p className="hidden md:inline">Connect Wallet</p>
      )}
    </div>
  );
};
