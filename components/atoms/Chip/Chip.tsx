import randomColor from 'randomcolor';
import React from 'react';

interface ChipProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Label of chip
   */
  label: string | number;
  /**
   * What background color to use
   */
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'default' | 'gray' | 'random';
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
    default: 'bg-neutral-50 text-neutral-800',
    primary: 'bg-primary-900 text-white',
    secondary: 'bg-secondary-900 text-white',
    warning: 'bg-warning-500 text-white',
    success: 'bg-success-500 text-white',
    danger: 'bg-danger-500 text-white',
    gray: 'bg-neutral-200 text-neutral-500'
  };
  return (
    <label
      className={`inline-flex flex-row items-center w-auto border font-medium ${
        color !== 'random' ? colors[color] : 'text-neutral-700'
      } ${sizes[size]} ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ backgroundColor: color === 'random' ? randomColor({ luminosity: 'light' }) : '' }}
      {...props}>
      {label}
    </label>
  );
};

export default Chip;
