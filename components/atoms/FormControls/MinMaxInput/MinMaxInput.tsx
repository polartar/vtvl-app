import Chip from '@components/atoms/Chip/Chip';
import React from 'react';

interface MinMaxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max: number;
  onMinChange: (e: any) => void;
  onMaxChange: (e: any) => void;
  onUseMax?: (e?: any) => void;
}

/**
 * Range slider for VTVL brand
 * Mimics the default HTML's input range.
 */
const MinMaxInput = ({ min = 1, max, onMinChange, onMaxChange, onUseMax, ...props }: MinMaxInputProps) => {
  return (
    <div className={`minMaxInput ${props.className}`}>
      {/* minimum */}
      <input type="number" className="grow w-full bg-neutral-50" value={min} min={1} onChange={onMinChange} />
      {/* maximum */}
      <input
        type="number"
        className="grow w-full bg-neutral-50 text-right"
        value={max}
        min={1}
        onChange={onMaxChange}
      />
      <Chip color={min < max ? 'secondary' : 'default'} label="MAX" onClick={min < max ? onUseMax : () => {}} />
    </div>
  );
};

export default MinMaxInput;
