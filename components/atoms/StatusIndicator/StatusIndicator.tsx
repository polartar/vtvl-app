import randomColor from 'randomcolor';

interface IStatusIndicatorProps {
  /**
   * What background color to use
   */
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'default' | 'gray' | 'random';
  /**
   * How large should the chip be?
   */
  size?: 'small' | 'default' | 'large';
}

const StatusIndicator = ({ color = 'default', size = 'small' }: IStatusIndicatorProps) => {
  const colors = {
    default: 'bg-neutral-50',
    primary: 'bg-primary-900',
    secondary: 'bg-secondary-900',
    warning: 'bg-warning-400',
    success: 'bg-success-400',
    info: 'bg-blue-400',
    danger: 'bg-danger-400',
    gray: 'bg-neutral-200'
  };
  const sizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-6 h-6'
  };
  return (
    <div
      className={`rounded-full ${color !== 'random' ? colors[color] : ''} ${sizes[size]}`}
      style={{ backgroundColor: color === 'random' ? randomColor({ luminosity: 'light' }) : '' }}></div>
  );
};

export default StatusIndicator;
