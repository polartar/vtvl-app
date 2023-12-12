import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import TokenBurnModal from '@components/organisms/TokenBurnModal';
import { useModal } from 'hooks/useModal';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TokenProfileProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  logo?: string;
  name?: string;
  symbol?: string;
  size?: 'small' | 'default';
  layout?: 'loose' | 'compact';
  address?: string;
  burnable?: boolean;
}

const TokenProfile = ({
  logo,
  name,
  symbol = '',
  size = 'default',
  address,
  burnable = false,
  layout = 'loose',
  ...props
}: TokenProfileProps) => {
  const { ModalWrapper, showModal, hideModal } = useModal({});

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
    <div className={`flex flex-row items-center gap-2 ${props.className}`}>
      <div className={twMerge('flex gap-1', layout === 'loose' ? 'flex-row items-center' : 'flex-col')}>
        <div className="flex flex-row items-center gap-2">
          {logo ? <img src={logo} className={`rounded-full ${sizes[size].image}`} alt={name} /> : null}
          {name ? <h3 className={`font-semibold inter ${sizes[size].name}`}>{name}</h3> : null}
          {symbol ? <Chip label={symbol} rounded /> : null}
          {burnable && address && layout === 'compact' ? (
            <Chip className="cursor-pointer" label="Burn" color="danger" size="small" onClick={showModal} />
          ) : null}
        </div>
        {address ? (
          <div className="text-sm font-medium text-netural-900 leading-none">
            <span className="text-neutral-500">
              <Copy text={address}>
                {address.slice(0, 5)}...{address.slice(-4)}
              </Copy>
            </span>
          </div>
        ) : null}
      </div>
      {burnable && address && layout === 'loose' ? (
        <Chip className="cursor-pointer" label="Burn" color="danger" size="small" onClick={showModal} />
      ) : null}
      <ModalWrapper>
        <TokenBurnModal hideModal={hideModal} />
      </ModalWrapper>
    </div>
  );
};

export default TokenProfile;
