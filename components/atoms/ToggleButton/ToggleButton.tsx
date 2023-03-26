import React, { useMemo } from 'react';

import { ToggleButtonProps } from './utils';

export const ToggleButton: React.FC<ToggleButtonProps> = ({ value = false, className = '', onClick }) => {
  const buttonClassNames = useMemo(
    () =>
      [
        'rounded-3xl overflow-hidden relative',
        'w-[32px] h-5 p-0',
        value ? 'bg-primary-900' : 'bg-neutral-200',
        className
      ].join(' '),
    [value, className]
  );

  const spanClassNames = useMemo(
    () =>
      [
        'bg-white w-[14px] h-[14px] rounded-full',
        'ease-out duration-300',
        'absolute top-[2px]',
        value ? 'left-[14px]' : 'left-[2px]'
      ].join(' '),
    [value]
  );

  return (
    <button type="button" className={buttonClassNames} onClick={onClick}>
      <span className={spanClassNames}></span>
    </button>
  );
};
