import randomColor from 'randomcolor';
import React from 'react';
import { CommonLabelType } from 'types/shared';

interface ChipProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Label of chip
   */
  label: CommonLabelType;
  /**
   * What background color to use
   */
  color?:
    | 'primary'
    | 'primaryAlt'
    | 'secondary'
    | 'secondaryAlt'
    | 'danger'
    | 'dangerAlt'
    | 'success'
    | 'successAlt'
    | 'warning'
    | 'warningAlt'
    | 'info'
    | 'infoAlt'
    | 'default'
    | 'alt'
    | 'gray'
    | 'grayAlt'
    | 'random';
  /**
   * How large should the chip be?
   */
  size?: 'small' | 'default' | 'large';
  /**
   * How large should the chip be?
   */
  rounded?: boolean;

  className?: string;
}

/**
 * Primary UI component for user interaction
 */
const Chip = ({ size = 'default', color = 'default', label, rounded = false, className = '', ...props }: ChipProps) => {
  const sizes = {
    small: 'py-0 px-2 text-xs h-6',
    default: 'py-0.5 px-2 text-sm',
    large: 'text-base px-2 py-1'
  };
  const colors = {
    default: 'bg-neutral-50 text-neutral-800 border-neutral-50',
    alt: 'bg-neutral-50 border-neutral-300 text-neutral-500',
    primary: 'bg-primary-900 text-white border-primary-900',
    primaryAlt: 'bg-primary-100 text-primary-900 border-primary-200',
    secondary: 'bg-secondary-900 text-white border-secondary-900',
    secondaryAlt: 'bg-secondary-100 text-secondary-900 border-secondary-100',
    warning: 'bg-warning-400 text-warning-100 border-warning-300',
    warningAlt: 'bg-warning-100 text-warning-500 border-warning-200',
    success: 'bg-success-400 text-success-100 border-success-300',
    successAlt: 'bg-success-100 text-success-500 border-success-200',
    info: 'bg-blue-400 text-blue-100 border-blue-300',
    infoAlt: 'bg-blue-100 text-blue-500 border-blue-200',
    danger: 'bg-danger-400 text-danger-100 border-danger-300',
    dangerAlt: 'bg-danger-100 text-danger-500 border-danger-200',
    gray: 'bg-neutral-200 text-neutral-500 border-neutral-100',
    grayAlt: 'bg-neutral-100 text-neutral-400 border-neutral-200'
  };
  return (
    <label
      className={`inline-flex flex-row items-center w-auto border font-medium whitespace-nowrap ${
        color !== 'random' ? colors[color] : 'text-neutral-700'
      } ${sizes[size]} ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ backgroundColor: color === 'random' ? randomColor({ luminosity: 'light' }) : '' }}
      {...props}>
      {label}
    </label>
  );
};

export default Chip;
