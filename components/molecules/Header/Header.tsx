import SearchInput from '@components/atoms/FormControls/SearchInput/SearchInput';
import NetworkSelector from '@components/atoms/NetworkSelector/NetworkSelector';
import WalletConnect from '@components/atoms/WalletConnect/WalletConnect';
import AuthContext from '@providers/auth.context';
import { useWeb3React } from '@web3-react/core';
import Router from 'next/router';
import React, { useContext } from 'react';
import { IUser } from 'types/models';

interface HeaderProps {
  user: IUser | undefined;
  connected: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
  toggleSideBar?: () => void;
}

const Header = ({ connected, onLogin, onLogout, user, onCreateAccount, toggleSideBar }: HeaderProps) => {
  const { active, account } = useWeb3React();

  return (
    <header className="sticky top-0 z-40 w-full h-20 flex flex-row gap-3 md:gap-5 justify-between items-center bg-gray-50 px-3 md:px-6 lg:px-8 border-b border-gray-300">
      <div className="flex flex-row items-center">
        {/* Remove after using context to show/hide the sidebar */}
        <img
          src="/icons/collapse-btn.svg"
          alt="toggle sidebar"
          onClick={toggleSideBar}
          className="fixed top-7 left-1 h-6 w-6 cursor-pointer opacity-10"
          data-tip="Toggle sidebar"
        />
        <img src="/icons/vtvl-icon.svg" className="h-10 sm:hidden md:h-12" onClick={() => Router.push('/onboarding')} />
        <img
          src="/logo.svg"
          className="hidden sm:block w-48 h-9 mr-5 cursor-pointer"
          alt="VTVL"
          onClick={() =>
            user?.memberInfo?.type === 'employee' ? Router.push('/onboarding/member') : Router.push('/onboarding')
          }
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
        {active ? <NetworkSelector /> : null}
        <WalletConnect connected={active} account={account || ''} />
      </div>
    </header>
  );
};

export default Header;