import React from 'react';

interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max: number;
}

/**
 * Range slider for VTVL brand
 * Mimics the default HTML's input range.
 */
const RangeSlider = ({ max, ...props }: RangeSliderProps) => {
  return (
    <div className={props.className}>
      <input type="range" min={1} max={max} list="rangelist" {...props} className="w-full" />
      <datalist
        id="rangelist"
        className="flex flex-row items-center justify-between text-xs text-neutral-700 font-medium">
        <option value={0}>0%</option>
        <option value={25}>25%</option>
        <option value={50}>50%</option>
        <option value={75}>75%</option>
        <option value={100}>100%</option>
      </datalist>
    </div>
  );
};

export default RangeSlider;
