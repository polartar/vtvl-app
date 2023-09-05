import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { connectionAssets } from 'types/constants/shared';
import { truncateAddress } from 'utils/web3';

import AuthContext from '../../../providers/auth.context';

interface Props {
  account?: string;
  connected: boolean;
  connectWallet?: void;
  onConnect?: () => void;
}

const WalletConnect = ({ account, connected, onConnect = () => {} }: Props) => {
  const { activate, deactivate } = useWeb3React();
  const { logOut, connection } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);

  // Function intended for the overall clickable area of the connect wallet button
  const handleClick = async () => {
    // User is logged in and wallet is connected
    if (account && connected) {
      setExpanded((prev) => !prev);
    } else {
      try {
        if (connection) {
          connection === 'metamask' ? await activate(injected) : await activate(walletconnect);
          toast.success(`Your wallet ${account} is now connected`);
        } else {
          onConnect?.();
        }
      } catch (err) {
        toast.error('Connect wallet failed!');
      }
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
    <div className="h-10 transition-all relative" tabIndex={0} onBlur={() => setExpanded(false)} onClick={handleClick}>
      <div
        className={twMerge(
          'h-10 w-10 md:w-auto shrink-0 flex flex-row items-center justify-center md:justify-start gap-2 rounded-3xl md:px-4 text-gray-50 font-semibold text-sm cursor-pointer transition-all hover:brightness-125',
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
            <div className="p-0.5 bg-white rounded-full h-7 w-7 flex items-center justify-center">
              <img
                className={twMerge(connection === 'metamask' ? 'h-4' : 'h-5', 'flex-shrink-0')}
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
        <div className="absolute right-0 w-40 mt-2 text-sm bg-neutral-50 border border-primary-900 rounded-xl overflow-hidden">
          {menuItems.map((menu, menuIndex) => (
            <div
              key={`menu-${menuIndex}`}
              className="py-3 px-4 cursor-pointer transition-all hover:bg-primary-700 hover:text-white"
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
