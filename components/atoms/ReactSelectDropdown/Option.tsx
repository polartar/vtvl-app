/**
 * This is a custom component to show the option of the Select component from react-select.
 * The purpose is to customize the UI based on VTVL's UI design.
 * This will show both the contract name and the Safe name it belongs to
 * <Select components={{ Option: ReactSelectOption }} />
 * This can be further optimized to cater other dynamic values in case the UI changes
 */
import DownChevron from 'public/icons/collapse-btn.svg';
import { useState } from 'react';
import { truncateLabel } from 'utils/shared';

const ReactSelectOption = ({ innerRef, innerProps, isDisabled, isSelected, data: { label, safe }, ...props }: any) => {
  // Have to handle the hovering via JS because Tailwind group inside this component does not work accurately.
  const [hover, setHover] = useState(false);

  return !isDisabled ? (
    <div
      ref={innerRef}
      {...innerProps}
      className={`relative group grid grid-cols-2 gap-4 py-3.5 mb-1 px-[18px] text-primary-900 font-medium rounded-lg cursor-pointer hover:bg-primary-50 ${
        isSelected ? 'bg-primary-50' : ''
      }`}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}>
      <div title={label}>{safe ? truncateLabel(label, 24) : label}</div>
      {safe ? (
        <div className="text-neutral-900 flex flex-row items-center gap-2">
          <img src="/icons/safe.png" className="w-4" alt={safe?.safe_name || safe?.org_name || 'Safe'} />
          {safe?.safe_name || safe?.org_name || 'Safe'}
        </div>
      ) : null}
      {hover || isSelected ? (
        <div className="absolute right-4 top-4">
          <DownChevron className="text-primary-900 h-[18px] w-[18px] rotate-90 rounded-full" />
        </div>
      ) : null}
    </div>
  ) : null;
};

export default ReactSelectOption;
