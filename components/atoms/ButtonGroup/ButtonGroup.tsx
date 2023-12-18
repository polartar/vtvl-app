import { twMerge } from 'tailwind-merge';

import { Typography } from '../Typography/Typography';

interface IButtonGroupProps {
  buttons: Array<{
    label: string;
    icon?: JSX.Element;
    onClick: () => void;
  }>;
}

const ButtonGroup = ({ buttons }: IButtonGroupProps) => {
  return buttons.length ? (
    <div className="flex items-center">
      {buttons.map((button, index) => {
        return (
          <button
            key={index}
            className={twMerge(
              'flex items-center justify-center gap-2 py-1.5 px-4 h-8 border-t border-b border-l border-r-0 border-neutral-300 rounded-none bg-transparent grow min-h-8 font-medium hover:bg-neutral-100',
              !index ? 'rounded-l-lg' : '',
              index === buttons.length - 1 ? 'rounded-r-lg border-r' : ''
            )}
            onClick={button.onClick}>
            {button.icon && button.icon}
            <Typography size="caption" className="font-semibold text-neutral-700">
              {button.label}
            </Typography>
          </button>
        );
      })}
    </div>
  ) : null;
};

export default ButtonGroup;
