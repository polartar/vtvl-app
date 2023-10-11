import styled from '@emotion/styled';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import DotLoader from '../DotLoader/DotLoader';

const ConnectButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  min-height: 140px;
  outline: none;
  border: 1px solid transparent;
  transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease;
  cursor: pointer;
  padding-top: 24px;
  padding-bottom: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #d0d5dd;
    box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  }

  &:disabled,
  &[disabled] {
    border: none;
    background: transparent !important;
  }
`;
interface WalletButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  image: string | JSX.Element;
  label: string;
  subLabel?: string | JSX.Element | JSX.Element[];
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}
const WalletButton = ({ image, label, subLabel, disabled = false, isLoading = false, ...props }: WalletButtonProps) => {
  return (
    <ConnectButton
      {...props}
      disabled={disabled}
      className={twMerge(
        'wallet-button',
        disabled && !isLoading ? 'grayscale opacity-50' : isLoading ? 'opacity-90' : ''
      )}>
      {typeof image === 'string' ? <img src={image} alt={label} className="mb-5" /> : image}
      <div className="text-sm font-medium text-neutral-800">{isLoading ? <DotLoader /> : label}</div>
      {subLabel ? <p>{subLabel}</p> : null}
    </ConnectButton>
  );
};

export default WalletButton;
