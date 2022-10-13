import Chip from '@components/atoms/Chip/Chip';

interface TokenProfileProps {
  logo: string;
  name: string;
  symbol: string;
}

const TokenProfile = ({ logo, name, symbol }: TokenProfileProps) => {
  return (
    <div className="flex flex-row items-center gap-2.5">
      {logo ? <img src={logo} className="rounded-full h-12 w-12" alt={name} /> : null}
      <h3 className="h2 font-bold">{name}</h3>
      <Chip label={symbol} rounded />
    </div>
  );
};

export default TokenProfile;
