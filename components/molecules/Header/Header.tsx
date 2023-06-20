import MediaAsset from '@components/atoms/MediaAsset/MediaAsset';
import NetworkSelector from '@components/atoms/NetworkSelector/NetworkSelector';
import SafeSelector from '@components/atoms/SafeSelector/SafeSelector';
import WalletConnect from '@components/atoms/WalletConnect/WalletConnect';
import { useGlobalContext } from '@providers/global.context';
import { useWeb3React } from '@web3-react/core';
import Router, { useRouter } from 'next/router';
import React from 'react';
import Fade from 'react-reveal/Fade';
import { IUser } from 'types/models';
import { NO_CONNECT_WALLET_BUTTON_PAGES, WEBSITE_NAME } from 'utils/constants';

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
  const { pathname } = useRouter();
  const {
    website: { assets, name }
  } = useGlobalContext();

  // Redirects the user to the right URL depending on the user's login state eg., /onboarding for non-logged in, /dashboard for logged-in users
  const redirectToHome = () => {
    let url = '/onboarding';
    if (user) {
      if (user?.memberInfo?.type === 'employee') {
        url = '/onboarding/member';
      } else {
        url = '/dashboard';
      }
    }
    Router.push(url);
  };

  const displayWalletConnect = NO_CONNECT_WALLET_BUTTON_PAGES.every((o) => pathname !== o);

  const renderVTVLLogo = () => {
    return (
      <div className={`flex flex-row items-center`}>
        <MediaAsset
          src={assets?.logoIcon?.src || '/icons/vtvl-icon.svg'}
          className="h-10 sm:hidden md:h-12"
          alt={name || WEBSITE_NAME}
          onClick={redirectToHome}
        />
        <MediaAsset
          src={assets?.logoImage?.src || '/logo.svg'}
          className="hidden sm:block w-48 h-12 cursor-pointer"
          alt={name || WEBSITE_NAME}
          onClick={redirectToHome}
        />
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-40 w-full h-20 bg-gray-50 flex flex-col items-center border-b border-gray-300`}>
      {/* Header with wallet and network selection section */}
      <Fade top when={displayWalletConnect}>
        <div className="w-full flex flex-row gap-3 md:gap-5 justify-between h-20 absolute z-10 px-3 md:px-6 ">
          {renderVTVLLogo()}
          <div
            className={`flex flex-row items-center gap-1.5 sm:gap-2 lg:gap-3.5 flex-shrink-0 transition-all delay-300 ${
              displayWalletConnect ? 'w-auto' : 'w-0'
            }`}>
            <SafeSelector />
            <NetworkSelector />
            <WalletConnect connected={active} account={account || ''} />
          </div>
        </div>
      </Fade>
      {/* Header with logo only */}
      <Fade top when={!displayWalletConnect}>
        <div className="w-full flex flex-row gap-3 md:gap-5 justify-center h-20 absolute px-3 md:px-6 ">
          {renderVTVLLogo()}
        </div>
      </Fade>
    </header>
  );
};

export default Header;
