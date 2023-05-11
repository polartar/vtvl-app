import styled from '@emotion/styled';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { IWebsiteAsset } from 'types/models';

import MediaAsset from '../MediaAsset/MediaAsset';

const Label = styled.label<{ disabled?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 30px;

  width: 275px;
  border-radius: 26px;
  border: 2px solid transparent;

  font-size: 14px;
  color: var(--neutral-900);

  cursor: pointer;
  transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease;

  ${({ disabled }) =>
    disabled
      ? 'opacity: 0.6;'
      : '&:hover, &.selected { border-color: var(--primary-900); box-shadow: 0 10px 20px -15px rgba(56, 56, 56, 0.6); transform: translateY(-2px);}'}
`;

const Check = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background-color: var(--primary-50);
  border: 1px solid var(--primary-900);

  &.selected {
    background-color: var(--primary-900);
  }
`;

interface CardRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  image: IWebsiteAsset;
  value: string;
  name: string;
  label: string | string[] | JSX.Element | JSX.Element[];
  onClick?: () => void;
}

/**
 * UI component for a radio group's single item
 */
const CardRadio = ({ image, label, value, name, ...props }: CardRadioProps) => {
  const [hover, setHover] = useState(false);
  return (
    <Label
      disabled={props.disabled}
      className={twMerge(
        'card-radio pt-16 pb-6 overflow-hidden',
        props.checked ? 'selected' : '',
        image.animated ? 'px-0' : 'px-6'
      )}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <MediaAsset
        {...image}
        active={props.checked || hover}
        classOnComplete={(condition: boolean) => twMerge(condition ? 'w-full scale-125' : 'h-40')}
      />
      <p className={twMerge('font-semibold h-11', image.animated ? 'px-6' : 'px-0')}>{label}</p>
      <Check className={props.checked ? 'selected' : ''}>
        {props.checked ? <img src="/icons/check.svg" alt={`${value} selected`} /> : null}
      </Check>
      <input
        type="radio"
        value={value}
        {...props}
        name={name}
        className="absolute opacity-0 -z-10"
        onChange={props.onChange}
      />
    </Label>
  );
};

export default CardRadio;
