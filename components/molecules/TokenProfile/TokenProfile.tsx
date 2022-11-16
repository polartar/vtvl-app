import Chip from '@components/atoms/Chip/Chip';

interface TokenProfileProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  logo?: string;
  name?: string;
  symbol?: string;
  size?: 'small' | 'default';
}

const TokenProfile = ({ logo, name, symbol = '', size = 'default', ...props }: TokenProfileProps) => {
  const sizes = {
    small: {
      image: 'w-8 h-8',
      name: 'text-lg'
    },
    default: {
      image: 'w-12 h-12',
      name: 'h2'
    }
  };
  return (
    <div className={`flex flex-row items-center gap-2.5 ${props.className}`}>
      {logo ? <img src={logo} className={`rounded-full ${sizes[size].image}`} alt={name} /> : null}
      {name ? <h3 className={`font-semibold inter ${sizes[size].name}`}>{name}</h3> : null}
      {symbol ? <Chip label={symbol} rounded /> : null}
    </div>
  );
};

export default TokenProfile;
