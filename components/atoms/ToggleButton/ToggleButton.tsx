import React, { useMemo } from 'react';

import { ToggleButtonProps } from './utils';

export const ToggleButton: React.FC<ToggleButtonProps> = ({ value = false, className = '', onClick }) => {
  const buttonClassNames = useMemo(
    () =>
      [
        'rounded-3xl overflow-hidden relative',
        'w-[40px] h-[22px]',
        value ? 'bg-primary-900' : 'bg-neutral-200',
        className
      ].join(' '),
    [value, className]
  );

  const spanClassNames = useMemo(
    () =>
      [
        'bg-white w-[18px] h-[18px] rounded-full',
        'ease-in duration-300',
        'absolute top-[1px]',
        value ? 'right-[2px]' : 'left-[2px]'
      ].join(' '),
    [value]
  );

  return (
    <button type="button" className={buttonClassNames} onClick={onClick}>
      <span className={spanClassNames}></span>
    </button>
  );
};
