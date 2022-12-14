import styled from '@emotion/styled';
import React from 'react';
import { formatNumber } from 'utils/token';

interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max: number;
}

/**
 * Range slider for VTVL brand
 * Mimics the default HTML's input range.
 */
const RangeSlider = ({ max, ...props }: RangeSliderProps) => {
  const hideTipOnValues = [0, 25, 50, 75, 100];
  const percentValue = Math.round(props.value ? (+props.value / max) * 100 : 0);
  return (
    <div className={`${props.className} relative`}>
      <input type="range" min={1} max={max} list="rangelist" {...props} className="w-full" />
      <datalist
        id="rangelist"
        className="flex flex-row items-center justify-between text-xs text-neutral-700 font-medium">
        <option value={0}>0%</option>
        <option value={max * 0.25}>25%</option>
        <option value={max * 0.5}>50%</option>
        <option value={max * 0.75}>75%</option>
        <option value={max * 1}>100%</option>
      </datalist>
      {props.value && !hideTipOnValues.includes(percentValue) ? (
        <SliderTooltip
          percent={percentValue}
          className="absolute -bottom-4 inline-block bg-primary-900 rounded-lg py-1 text-white opacity-90 text-xs text-center w-12">
          {formatNumber(percentValue, 0)}%
        </SliderTooltip>
      ) : null}
    </div>
  );
};

const SliderTooltip = styled.div<{
  percent: number;
}>`
  left: ${({ percent }) => percent + '%'};
  transform: translate(-50%, -50%);
  // &::before {
  //   content: '';
  //   position: absolute;
  //   top: -5px;
  //   left: 50%;
  //   transform: translateX(-50%);
  //   width: 0;
  //   height: 0;
  //   border-left: 5px solid transparent;
  //   border-right: 5px solid transparent;
  //   border-bottom: 5px solid var(--primary-900);
  // }
`;

export default RangeSlider;
