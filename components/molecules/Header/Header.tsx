import MediaAsset from '@components/atoms/MediaAsset/MediaAsset';
import NetworkSelector from '@components/atoms/NetworkSelector/NetworkSelector';
import SafeSelector from '@components/atoms/SafeSelector/SafeSelector';
import WalletConnect from '@components/atoms/WalletConnect/WalletConnect';
import { useGlobalContext } from '@providers/global.context';
import { useWeb3React } from '@web3-react/core';
import Router, { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import Fade from 'react-reveal/Fade';
import { twMerge } from 'tailwind-merge';
import { IUser } from 'types/models';
import { IRole } from 'types/models/settings';
import { NO_CONNECT_WALLET_BUTTON_PAGES, PUBLIC_DOMAIN_NAME, REDIRECT_URIS, WEBSITE_NAME } from 'utils/constants';

interface HeaderProps {
  user: IUser | undefined;
  connected: boolean;
  onConnect?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
  toggleSideBar?: () => void;
}

const Header = ({ connected, onLogin, onLogout, user, onCreateAccount, toggleSideBar, onConnect }: HeaderProps) => {
  const { active, account } = useWeb3React();
  const { pathname } = useRouter();
  const currentPath = `${PUBLIC_DOMAIN_NAME}${pathname}`;
  const {
    website: { assets, name }
  } = useGlobalContext();

  // Redirects the user to the right URL depending on the user's login state eg., /onboarding for non-logged in, /dashboard for logged-in users
  const redirectToHome = useCallback(() => {
    let url = REDIRECT_URIS.AUTH_LOGIN;
    if (user) {
      if (user?.memberInfo?.role === IRole.EMPLOYEE) {
        url = '/onboarding/member';
      } else {
        url = REDIRECT_URIS.MAIN;
      }
    }
    // Trigger redirect only when outside the expected URL
    if (currentPath !== url) Router.push(url);
  }, [user, pathname]);

  const displayWalletConnect = NO_CONNECT_WALLET_BUTTON_PAGES.every((o) => pathname !== o);

  const renderVTVLLogo = () => {
    return (
      <div className={`flex flex-row items-center`}>
        <MediaAsset
          src={assets?.logoIcon?.src || '/icons/vtvl-icon.svg'}
          className="h-10 hidden md:h-12"
          alt={name || WEBSITE_NAME}
          onClick={redirectToHome}
        />
        <MediaAsset
          src={assets?.logoImage?.src || '/logo.svg'}
          className="block w-48 h-12 cursor-pointer"
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
        <div
          className={twMerge(
            'w-full flex flex-row gap-3 md:gap-5 h-20 absolute z-10 px-3 md:px-6',
            displayWalletConnect ? 'justify-between' : 'justify-center'
          )}>
          {renderVTVLLogo()}
          <div
            className={`flex-row items-center gap-1.5 sm:gap-2 lg:gap-3.5 flex-shrink-0 transition-all delay-300 ${
              displayWalletConnect ? 'flex w-auto' : 'hidden w-0'
            }`}>
            {user && <SafeSelector />}
            <NetworkSelector />
            <WalletConnect connected={active} account={account || ''} onConnect={onConnect} />
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
