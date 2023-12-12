import Chip from '@components/atoms/Chip/Chip';
import { Typography } from '@components/atoms/Typography/Typography';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface Option {
  label: string | number;
  value: string | number;
  // Optionals for the Tab variant
  icon?: string | JSX.Element;
  description?: string | JSX.Element;
  counter?: number | JSX.Element;
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
  variant?: 'tab' | 'tab-small' | 'pill'; // termporarily remove 'input' variant
}

const BarRadio = ({ label = '', options, required, className, variant = 'pill', ...props }: BarRadioProps) => {
  // Stores the container's class name and sets the default value
  const defaultContainerClass =
    'barRadio inline-flex flex-row item-center justify-stretch border border-neutral-300 overflow-hidden';

  // Used for shorthand casing of variant conditions
  const variants = {
    tab: {
      container: `${defaultContainerClass} rounded-lg`,
      item: 'flex flex-row items-center justify-center gap-3 text-sm text-neutral-800 hover:bg-neutral-100 whitespace-nowrap max-w-[198px] py-2 px-3',
      active: 'bg-neutral-100',
      inactive: 'bg-white'
    },
    'tab-small': {
      container: `${defaultContainerClass} rounded-lg`,
      item: 'flex flex-row items-center justify-center gap-3 text-xs font-medium text-neutral-800 hover:bg-neutral-100 whitespace-nowrap max-w-[198px] py-1.5 px-4 h-8',
      active: 'bg-neutral-100',
      inactive: 'bg-white'
    },
    input: {
      container: `${defaultContainerClass} h-10 rounded-full`,
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
    <div className={className}>
      {label ? (
        <label className={`${required ? 'required' : ''}`}>
          <span>{label}</span>
        </label>
      ) : null}

      <div className={variants[variant].container}>
        {options.map((option, optionIndex) => (
          <label
            key={`bar-radio-option-${option.value}-${optionIndex}`}
            className={`cursor-pointer transition-all ${
              option.value == props.value ? variants[variant].active : variants[variant].inactive
            } ${optionIndex && variant !== 'pill' ? 'border-l' : ''} ${variants[variant].item}`}>
            {variant === 'tab' && option.icon ? (
              <div
                className={`w-6 h-6 flex-shrink-0 rounded-md bg-gray-50 flex items-center justify-center ${
                  option.value === props.value ? 'text-primary-900' : 'text-neutral-900'
                }`}>
                {option.icon}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <Typography
                size={variant === 'tab-small' ? 'caption' : 'body'}
                className={twMerge(
                  variant === 'tab-small' ? 'font-medium' : 'font-semibold',
                  variant === 'tab' ? (option.value === props.value ? 'text-primary-900' : 'text-neutral-900') : ''
                )}>
                <div className="flex flex-row items-center gap-2">
                  {option.label}
                  {option.counter ? (
                    <Chip
                      rounded
                      size={variant === 'tab-small' ? 'tiny' : 'small'}
                      color="gray"
                      label={option.counter.toString()}
                    />
                  ) : null}
                </div>
              </Typography>
              {variant === 'tab' || (variant === 'tab-small' && option.description) ? (
                <Typography size="caption" className="leading-tight">
                  {option.description}
                </Typography>
              ) : null}
            </div>
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
