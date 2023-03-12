import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import Image from 'next/image';
import Router from 'next/router';
import React, { useContext, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { connectionAssets } from 'types/constants/shared';
import { truncateAddress } from 'utils/web3';

import AuthContext from '../../../providers/auth.context';

interface Props {
  account?: string;
  connected: boolean;
  connectWallet?: void;
}

const WalletConnect = ({ account, connected }: Props) => {
  const { activate, deactivate } = useWeb3React();
  const { logOut, connection } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);

  // Function intended for the overall clickable area of the connect wallet button
  const handleClick = () => {
    // User is logged in and wallet is connected
    if (account && connected) {
      setExpanded((prev) => !prev);
    } else {
      activate(injected);
    }
  };

  // Disconnects the user's wallet
  const handleDisconnectWallet = async () => {
    try {
      await deactivate();
    } catch (err) {
      console.log('Something went wrong', err);
    }
  };

  // Dropdown item list
  const menuItems = [
    {
      label: 'Disconnect wallet',
      action: handleDisconnectWallet
    },
    {
      label: 'Logout',
      action: logOut
    }
  ];

  return (
    <div className="h-10 transition-all" tabIndex={0} onBlur={() => setExpanded(false)} onClick={handleClick}>
      <div
        className={twMerge(
          'h-10 shrink-0 flex flex-row items-center gap-2 rounded-3xl px-2 sm:px-2.5 text-gray-50 font-semibold text-sm cursor-pointer transition-all hover:brightness-125',
          connection === 'metamask'
            ? 'bg-metamask'
            : connection === 'walletconnect'
            ? 'bg-walletconnect'
            : 'bg-primary-900'
        )}>
        <img src="/icons/wallet.svg" className={twMerge('w-5', connected ? 'hidden md:block' : '')} alt="e-wallet" />
        {connected && account ? (
          <>
            <p className="hidden lg:inline">{truncateAddress(account)}</p>
            <div className="p-0.5 bg-white rounded-full h-6 w-6 flex items-center justify-center">
              <img
                className="h-5 flex-shrink-0"
                src={connection ? connectionAssets[connection].walletIcon : '/icons/avatar.svg'}
                alt="More"
              />
            </div>
          </>
        ) : (
          <p className="hidden md:inline">Connect Wallet</p>
        )}
      </div>
      {expanded && (
        <div className="mt-2 text-sm bg-neutral-50 border border-primary-900 rounded-xl overflow-hidden">
          {menuItems.map((menu, menuIndex) => (
            <div
              key={`menu-${menuIndex}`}
              className="py-2 px-3 cursor-pointer transition-all hover:bg-primary-700 hover:text-white"
              onClick={menu.action}>
              {menu.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
