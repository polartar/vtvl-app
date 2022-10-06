import gas from '@assets/gas.svg';
import vtvlIcon from '@assets/icons/vtvl-icon.svg';
import logo from '@assets/logo.svg';
import React from 'react';

import { NetworkSelector } from '../NetworkSelector/NetworkSelector';
import { SearchInput } from '../SearchInput/SearchInput';
import { WalletConnect } from '../WalletConnect/WalletConnect';

type User = {
  name: string;
};

interface HeaderProps {
  connected: boolean;
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export const Header = ({ connected, user, onLogin, onLogout, onCreateAccount }: HeaderProps) => {
  return (
    <header className="w-full h-20 flex flex-row gap-3 md:gap-5 justify-between items-center bg-gray-50 px-3 md:px-6 lg:px-8 border-b border-gray-300">
      <div className="flex flex-row items-center">
        <img src={vtvlIcon} className="h-10 sm:hidden md:h-12" />
        <img src={logo} className="hidden sm:block w-48 h-9 mr-5 cursor-pointer" alt="VTVL" />
        <div className="hidden md:block">
          <SearchInput placeholder="Search" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-1.5 sm:gap-2 lg:gap-3.5">
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <img src={gas} alt="Gas" className="w-4" />
          <p className="text-xs text-neutral-600">
            9 <span className="hidden sm:inline">gwei</span>
          </p>
        </div>
        <NetworkSelector />
        <WalletConnect connected={connected} />
      </div>
    </header>
  );
};
