import Chip from '@components/atoms/Chip/Chip';
import React from 'react';

interface MinMaxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max: number;
  onMinChange: (e: any) => void;
  onMaxChange?: (e: any) => void;
  onUseMax?: (e?: any) => void;
  maxReadOnly?: boolean;
}

/**
 * Range slider for VTVL brand
 * Mimics the default HTML's input range.
 */
const MinMaxInput = ({
  min = 1,
  max,
  onMinChange = () => {},
  onMaxChange = () => {},
  onUseMax = () => {},
  maxReadOnly = false,
  ...props
}: MinMaxInputProps) => {
  return (
    <div
      className={`minMaxInput flex items-center gap-2 relative border rounded-3xl py-3.5 px-6 h-13 bg-neutral-50 w-full border-neutral-300 text-sm text-neutral-700 shadow-sm transition-all ${props.className} `}>
      {/* minimum */}
      <input type="number" className="grow w-full bg-neutral-50" value={min} min={1} onChange={onMinChange} />
      {/* maximum */}
      <input
        type="number"
        className={`grow w-full bg-neutral-50 text-right ${maxReadOnly ? 'hidden' : ''}`}
        value={max}
        min={1}
        read-only={maxReadOnly.toString()}
        onChange={onMaxChange}
      />
      <Chip color={min < max ? 'secondary' : 'default'} label="MAX" onClick={min < max ? onUseMax : () => {}} />
    </div>
  );
};

export default MinMaxInput;
