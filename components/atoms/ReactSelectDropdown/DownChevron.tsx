/**
 * This is the customized dropdown icon for the Select react-select component usage.
 * This will display the drowndown icon based on the Figma design.
 * Should be used in the Select component like:
 * <Select components={{ DropdownIndicator: DownChevron }} />
 */
import DownChevron from 'public/icons/collapse-btn.svg';

const ReactSelectDownChevron = ({ isFocused = false, ...props }) => {
  return (
    <div {...props} className="mr-3.5">
      <DownChevron
        className={`text-primary-900 h-[18px] w-[18px] transition-all ${isFocused ? '-rotate-90' : 'rotate-90'}`}
      />
    </div>
  );
};

export default ReactSelectDownChevron;
