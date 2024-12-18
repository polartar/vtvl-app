import MinMaxInput from '@components/atoms/FormControls/MinMaxInput/MinMaxInput';
import RangeSlider from '@components/atoms/FormControls/RangeSlider/RangeSlider';
import { formatNumber } from 'utils/token';

interface LimitedSupplyProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  initial: number;
  minimum?: number;
  maximum: number;
  label?: string;
  maximumLabel?: string;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  onMaxChange?: (e: any) => void;
  onMinChange: (e: any) => void;
  onUseMax: (e?: any) => void;
  maxReadOnly?: boolean;
}

const LimitedSupply = ({
  required = false,
  label = '',
  maximumLabel = 'Token total supply',
  initial,
  minimum = 1,
  maximum,
  className = '',
  onMaxChange,
  onMinChange,
  onUseMax,
  maxReadOnly = false,
  ...props
}: LimitedSupplyProps) => {
  return (
    <>
      <label className={`${required ? 'required' : ''} ${className}`}>
        <div className="flex flex-row items-center justify-between gap-3">
          {label ? (
            <>
              <span className={`form-label ${required ? 'required' : ''}`}>{label}</span>
              {maxReadOnly ? (
                <p className="text-xs font-medium text-neutral-700">
                  {maximumLabel}: {formatNumber(maximum)}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <MinMaxInput
          initial={initial}
          min={minimum}
          max={maximum}
          onMinChange={onMinChange}
          onMaxChange={onMaxChange}
          onUseMax={onUseMax}
          maxReadOnly={maxReadOnly}
          placeholder={props.placeholder}
        />
        <RangeSlider max={maximum} value={initial} className="mt-5" onChange={onMinChange} />
      </label>
    </>
  );
};

export default LimitedSupply;
