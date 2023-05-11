import Chip from '@components/atoms/Chip/Chip';
import WalletButton from '@components/atoms/WalletButton/WalletButton';
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
            subLabel={
              wallet.subLabel ? (
                <Chip size="tiny" color="primary" rounded={true} label={wallet.subLabel as string} />
              ) : (
                ''
              )
            }
            disabled={wallet.disabled}
            onClick={wallet.onClick}
          />
        </div>
      ))}
    </div>
  );
};
export default Wallets;
