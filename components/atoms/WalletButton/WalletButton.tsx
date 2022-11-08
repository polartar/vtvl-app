import styled from '@emotion/styled';
import React from 'react';

const ConnectButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  height: 120px;
  outline: none;
  border: 1px solid transparent;
  transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: #d0d5dd;
    box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  }
`;
interface WalletButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  image: string | JSX.Element;
  label: string;
  subLabel?: string | JSX.Element | JSX.Element[];
  disabled?: boolean;
  onClick?: () => void;
}
const WalletButton = ({ image, label, subLabel, disabled = false, ...props }: WalletButtonProps) => {
  return (
    <ConnectButton {...props} disabled={disabled} className={`wallet-button ${disabled ? 'grayscale opacity-50' : ''}`}>
      {typeof image === 'string' ? <img src={image} alt={label} className="mb-5" /> : image}
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      {subLabel ? <p>{subLabel}</p> : null}
    </ConnectButton>
  );
};

export default WalletButton;
