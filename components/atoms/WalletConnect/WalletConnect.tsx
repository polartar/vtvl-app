import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import Image from 'next/image';
import Router from 'next/router';
import React, { useContext, useState } from 'react';
import { truncateAddress } from 'utils/web3';

import AuthContext from '../../../providers/auth.context';

interface Props {
  account?: string;
  connected: boolean;
  connectWallet?: void;
}

const WalletConnect = ({ account, connected }: Props) => {
  const { activate, deactivate } = useWeb3React();
  const { logOut } = useContext(AuthContext);
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
    <div className="h-10" tabIndex={0} onBlur={() => setExpanded(false)} onClick={handleClick}>
      <div className="h-10 shrink-0 flex flex-row items-center gap-2 bg-primary-900 rounded-3xl px-2 sm:px-3 text-gray-50 font-semibold text-sm cursor-pointer transition-all hover:brightness-125">
        <img src="/icons/wallet.svg" className={`w-5 ${connected ? 'hidden md:block' : ''}`} alt="e-wallet" />
        {connected && account ? (
          <>
            <p className="hidden lg:inline">{truncateAddress(account)}</p>
            <img className="w-6" src="/icons/avatar.svg" alt="More" />
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
