import MinMaxInput from '@components/atoms/FormControls/MinMaxInput/MinMaxInput';
import RangeSlider from '@components/atoms/FormControls/RangeSlider/RangeSlider';

interface LimitedSupplyProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  initial: number;
  maximum: number;
  label?: string;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  onMaxChange: (e: any) => void;
  onMinChange: (e: any) => void;
  onUseMax: (e?: any) => void;
}

const LimitedSupply = ({
  required = false,
  label = '',
  initial,
  maximum,
  className = '',
  onMaxChange,
  onMinChange,
  onUseMax
}: LimitedSupplyProps) => {
  return (
    <>
      <label className={`${required ? 'required' : ''} ${className}`}>
        {label ? <span>{label}</span> : null}
        <MinMaxInput
          min={initial}
          max={maximum}
          onMinChange={onMinChange}
          onMaxChange={onMaxChange}
          onUseMax={onUseMax}
        />
        <RangeSlider max={maximum} value={initial} className="mt-5" onChange={onMinChange} />
      </label>
    </>
  );
};

export default LimitedSupply;
