import React, { useEffect, useState } from 'react';

interface Option {
  label: string | number;
  value: string | number;
}

interface BarRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  required?: boolean;
  options: Option[];
  // Props for enhancing validation visual cues
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  variant?: 'tab' | 'input' | 'pill';
}

const BarRadio = ({ label = '', options, required, className, variant = 'input', ...props }: BarRadioProps) => {
  // Stores the container's class name and sets the default value
  const defaultContainerClass =
    'barRadio flex flex-row item-center justify-stretch border border-neutral-300 overflow-hidden h-10';

  // Used for shorthand casing of variant conditions
  const variants = {
    tab: {
      container: `${defaultContainerClass} rounded-lg w-max`,
      item: 'flex flex-row items-center justify-center text-sm text-neutral-800 hover:bg-neutral-100 w-32',
      active: 'bg-neutral-100',
      inactive: 'bg-white'
    },
    input: {
      container: `${defaultContainerClass} rounded-full`,
      item: 'shrink-0 grow text-xs hover:bg-primary-900 hover:text-neutral-50',
      active: 'bg-primary-900 text-neutral-50',
      inactive: 'bg-neutral-50 text-neutral-800'
    },
    pill: {
      container: 'flex flex-row items-center flex-wrap justify-start gap-2',
      item: 'inline-flex flex-row items-center w-auto border h-8 font-medium whitespace-nowrap py-0.5 px-2 text-sm rounded-full cursor-pointer transform transition-all hover:-translate-y-px hover:bg-primary-900 hover:text-neutral-50 hover:border-primary-900',
      active: 'bg-primary-900 text-neutral-50 border-primary-900',
      inactive: 'bg-neutral-50 text-neutral-800 border-neutral-300'
    }
  };

  return (
    <div>
      {label ? (
        <label className={`${required ? 'required' : ''} ${className}`}>
          <span>{label}</span>
        </label>
      ) : null}

      <div className={variants[variant].container}>
        {options.map((option, optionIndex) => (
          <label
            key={`bar-radio-option-${option.value}-${optionIndex}`}
            className={`cursor-pointer ${
              option.value == props.value ? variants[variant].active : variants[variant].inactive
            } ${optionIndex && variant !== 'pill' ? 'border-l' : ''} ${variants[variant].item}`}>
            {option.label}
            <input
              type="radio"
              className="absolute opacity-0 -z-10 bg-transparent"
              {...props}
              value={option.value}
              onChange={props.onChange}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default BarRadio;
