import { EMilestoneFreq } from 'types/milestone';

interface Options {
  label: string;
  value: EMilestoneFreq;
}

interface ReleaseSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  options: Options[];
  index: number;
}

const ReleaseSelect = ({ className, options, ...props }: ReleaseSelectProps) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => {
        return (
          <div key={option.value}>
            <input
              {...props}
              type="radio"
              name={`freq_${props.index}`}
              value={option.value}
              id={`${option.label}_${props.index}`}
              checked={props.value === option.value}
              className="hidden "
            />
            <label
              htmlFor={`${option.label}_${props.index}`}
              className={` py-2 px-5 cursor-pointer rounded-md ${
                props.value === option.value ? 'bg-primary-400' : 'bg-gray-200'
              }`}>
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default ReleaseSelect;
