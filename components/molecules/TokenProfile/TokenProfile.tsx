import Chip from '@components/atoms/Chip/Chip';

interface TokenProfileProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  logo: string;
  name: string;
  symbol?: string;
}

const TokenProfile = ({ logo, name, symbol = '', ...props }: TokenProfileProps) => {
  return (
    <div className={`flex flex-row items-center gap-2.5 ${props.className}`}>
      {logo ? <img src={logo} className="rounded-full h-12 w-12" alt={name} /> : null}
      <h3 className="h2 font-semibold inter">{name}</h3>
      {symbol ? <Chip label={symbol} rounded /> : null}
    </div>
  );
};

export default TokenProfile;
