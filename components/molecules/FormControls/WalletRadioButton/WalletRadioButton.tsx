import Chip from '@components/atoms/Chip/Chip';
import Decimal from 'decimal.js';
import { formatNumber } from 'utils/token';

interface IWalletRadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string | JSX.Element;
  address: string;
  balance: number | Decimal;
  className?: string;
  symbol?: string;
}

const WalletRadioButton = ({
  icon = '/icons/wallets/space-suit.svg',
  address,
  balance,
  className = '',
  symbol,
  ...props
}: IWalletRadioButtonProps) => {
  return (
    <label
      className={`wallet-radio-button row-center justify-between py-3 px-4 border  rounded-2xl cursor-pointer transform transition-all group ${className} ${
        props.checked ? 'border-primary-700' : 'border-neutral-200 hover:border-primary-700'
      }`}>
      <div>
        <div className="flex flex-row items-center mb-1 gap-3">
          {typeof icon === 'string' ? <img src={icon} className="w-8 h-8" /> : icon}
          <span className="text-2xl font-semibold text-neutral-900 row-center">
            {formatNumber(balance)} {symbol ? <Chip label={symbol} size="small" color="gray" rounded /> : null}
          </span>
        </div>
        <span className="text-sm text-neutral-500">{address}</span>
      </div>
      <div
        className={`row-center justify-center w-6 h-6 rounded-full border ${
          props.checked ? 'bg-primary-900' : 'bg-neutral-100'
        } `}>
        {props.checked ? <img src="/icons/check.svg" alt="Selected" /> : null}
      </div>
      <input type="radio" className="absolute opacity-0" {...props} onChange={props.onChange} />
    </label>
  );
};

export default WalletRadioButton;
