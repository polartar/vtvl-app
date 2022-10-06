import CheckSvg from '@assets/icons/check.svg';
import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  selected?: string;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
  variant?: 'default' | 'input-style';
}

export const Radio = ({ variant = 'default', description = '', label = '', selected, ...props }: RadioProps) => {
  return (
    <label
      className={`flex-row cursor-pointer ${
        variant === 'input-style' ? 'radioButton flex-row cursor-pointer' : 'gap-3 items-start'
      }`}>
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full border ${
          variant === 'input-style' ? 'border-primary-900' : 'border-gray-300'
        } ${
          variant === 'input-style'
            ? props.checked
              ? 'bg-primary-900'
              : 'bg-primary-100'
            : props.checked
            ? 'bg-secondary-50 border-secondary-900'
            : 'bg-white'
        }`}>
        {props.checked && variant === 'input-style' ? <img src={CheckSvg} alt={label} /> : null}
        {props.checked && variant === 'default' ? <div className="w-2 h-2 bg-secondary-900 rounded-full"></div> : null}
      </div>
      <div className="flex flex-col gap-1 justify-start">
        <span className={`m-0 ${variant === 'input-style' ? 'text-gray-500' : 'text-sm text-neutral-700'} `}>
          {label || props.value}
        </span>
        {variant === 'default' && description ? <span className="text-neutral-500 text-sm">{description}</span> : null}
      </div>
      <input type="radio" className="absolute opacity-0 -z-10" {...props} onChange={props.onChange} />
    </label>
  );
};
