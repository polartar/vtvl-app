import Chip from '@components/atoms/Chip/Chip';
import React from 'react';
import { NumericFormat } from 'react-number-format';
import { InputNumberCommas } from 'react-number-format-with-commas';

interface MinMaxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  initial?: number;
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
  initial = 1,
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
      className={`minMaxInput flex items-center gap-2 relative border rounded-3xl py-3.5 px-6 h-10 bg-neutral-50 w-full border-neutral-300 text-sm text-neutral-700 shadow-sm transition-all ${props.className} `}>
      {/* minimum */}
      {/* <BigNumberInput {...props} decimals={6} value={props.value?.toString() || ''} onChange={onMinChange} /> */}
      <NumericFormat
        {...props}
        defaultValue={props.defaultValue as string | number}
        value={initial as string | number}
        type="text"
        thousandSeparator=","
        decimalScale={6}
        className="grow w-full outline-0 border-0 bg-transparent"
        isAllowed={(values) => {
          const { formattedValue, floatValue } = values;
          return formattedValue === '' || (floatValue ? floatValue >= 0 && floatValue <= max : false);
        }}
      />
      {/* <InputNumberCommas
        type="text"
        className="grow w-full bg-neutral-50"
        value={initial}
        min={min}
        max={max}
        onChange={onMinChange}
      /> */}
      {/* maximum */}
      <InputNumberCommas
        type="text"
        className={`grow w-full bg-neutral-50 text-right ${maxReadOnly ? 'hidden' : ''}`}
        value={max}
        min={min}
        read-only={maxReadOnly.toString()}
        onChange={onMaxChange}
      />
      <Chip color={initial < max ? 'secondary' : 'default'} label="MAX" onClick={initial < max ? onUseMax : () => {}} />
    </div>
  );
};

export default MinMaxInput;
