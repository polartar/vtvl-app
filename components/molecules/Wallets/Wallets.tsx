import Chip from '@components/atoms/Chip/Chip';
import WalletButton from '@components/atoms/WalletButton/WalletButton';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface IWallet {
  name: string;
  image: string | JSX.Element;
  subLabel?: unknown;
  disabled?: boolean;
  onClick?: () => void;
}

interface IWalletsProps {
  wallets: IWallet[];
}

const Wallets = ({ wallets }: IWalletsProps) => {
  const [loadingWallet, setLoadingWallet] = useState<null | number>(null);

  const handleClick = async (wallet: IWallet, windex: number) => {
    setLoadingWallet(windex);
    await wallet?.onClick?.();
    setLoadingWallet(null);
  };

  return (
    <div className="grid grid-cols-4 grid-flow-dense auto-cols-min gap-4">
      {wallets.map((wallet: IWallet, walletIndex: number) => (
        <div
          key={walletIndex}
          className={twMerge(
            'flex flex-row items-center justify-center col-span-2',
            wallets.length === 1 ? 'col-start-2' : ''
          )}>
          <WalletButton
            key={`wallet-button-${wallet.name}-${walletIndex}`}
            label={wallet.name}
            image={wallet.image}
            isLoading={loadingWallet === walletIndex}
            subLabel={
              wallet.subLabel ? (
                <Chip size="tiny" color="primary" rounded={true} label={wallet.subLabel as string} />
              ) : (
                ''
              )
            }
            disabled={wallet.disabled || typeof loadingWallet === 'number'}
            onClick={() => handleClick(wallet, walletIndex)}
          />
        </div>
      ))}
    </div>
  );
};
export default Wallets;
