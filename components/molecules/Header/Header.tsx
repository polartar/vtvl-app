import React from 'react';
import Router from 'next/router';
import { useWeb3React } from '@web3-react/core';
import SearchInput from '@components/atoms/FormControls/SearchInput/SearchInput';
import NetworkSelector from '@components/atoms/NetworkSelector/NetworkSelector';
import WalletConnect from '@components/atoms/WalletConnect/WalletConnect';
import { User } from 'firebase/auth';

interface HeaderProps {
  connected: boolean;
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

const Header = ({ connected, user, onLogin, onLogout, onCreateAccount }: HeaderProps) => {
  const { account, activate } = useWeb3React();
  return (
    <header className="sticky top-0 z-50 w-full h-20 flex flex-row gap-3 md:gap-5 justify-between items-center bg-gray-50 px-3 md:px-6 lg:px-8 border-b border-gray-300">
      <div className="flex flex-row items-center">
        <img src="/icons/vtvl-icon.svg" className="h-10 sm:hidden md:h-12" onClick={() => Router.push('/onboarding')} />
        <img
          src="/logo.svg"
          className="hidden sm:block w-48 h-9 mr-5 cursor-pointer"
          alt="VTVL"
          onClick={() => Router.push('/onboarding')}
        />
        <div className="hidden md:block">
          <SearchInput placeholder="Search" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-1.5 sm:gap-2 lg:gap-3.5">
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <img src="/icons/gas.svg" alt="Gas" className="w-4" />
          <p className="text-xs text-neutral-600">
            9 <span className="hidden sm:inline">gwei</span>
          </p>
        </div>
        <WalletConnect connected={connected} account={account || ''} />
        {connected ? <NetworkSelector />  : null}
      </div>
    </header>
  );
};

export default Header;
