import React from "react";

import { NetworkSelector } from "./NetworkSelector";
import { SearchInput } from "./form-controls/SearchInput";
import { WalletConnect } from "./WalletConnect";
import Image from "next/image";

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

export const Header = ({
  connected,
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: HeaderProps) => {
  return (
    <div className="w-full h-20 flex flex-row gap-3 md:gap-5 justify-between items-center px-3 md:px-6 lg:px-8 border-b border-gray-300">
      <div className="flex flex-row items-center">
        <img
          src="/icons/vtvl-icon.svg"
          className="h-10 sm:hidden md:h-12"
          alt="VTVL"
        />
        <img
          src="/logo.svg"
          className="hidden sm:block w-48 h-9 mr-5 cursor-pointer"
          alt="VTVL"
        />
        <div className="hidden md:block">
          <SearchInput placeholder="Search" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-1.5 sm:gap-2 lg:gap-3.5">
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <img src="/gas.svg" alt="Gas" className="w-4" />
          <p className="text-xs text-neutral-600">
            9 <span className="hidden sm:inline">gwei</span>
          </p>
        </div>
        <NetworkSelector />
        <WalletConnect connected={connected} />
      </div>
    </div>
  );
};
