import React from 'react';

interface ChipProps {
  /**
   * Label of chip
   */
  label: string;
  /**
   * What background color to use
   */
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
  /**
   * How large should the chip be?
   */
  size?: 'small' | 'default' | 'large';
  /**
   * How large should the chip be?
   */
  rounded?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
const Chip = ({ size = 'default', color = 'default', label, rounded = false, ...props }: ChipProps) => {
  const sizes = {
    small: 'py-0 px-1 text-xs',
    default: 'py-0.5 px-2 text-sm',
    large: 'text-base'
  };
  const colors = {
    default: 'bg-neutral-50 text-neutral-800',
    primary: 'bg-primary-900 text-white',
    secondary: 'bg-secondary-900 text-white',
    warning: 'bg-warning-500 text-white',
    success: 'bg-success-500 text-white',
    danger: 'bg-danger-500 text-white'
  };
  return (
    <label className={`border ${colors[color]} ${sizes[size]} ${rounded ? 'rounded-full' : ''}`} {...props}>
      {label}
    </label>
  );
};

export default Chip;
