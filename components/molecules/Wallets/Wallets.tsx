import Chip from '@components/atoms/Chip/Chip';
import WalletButton from '@components/atoms/WalletButton/WalletButton';

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
    <div className="grid grid-cols-2 grid-flow-dense auto-cols-min gap-4">
      {wallets.map((wallet: IWallet, walletIndex: number) => (
        <div key={walletIndex} className="flex flex-row items-center justify-center">
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
