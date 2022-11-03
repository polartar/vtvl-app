import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressCircleProps {
  value: number;
  max: number;
}

const ProgressProvider = ({ valueStart, valueEnd, children }: any) => {
  const [value, setValue] = useState(valueStart);
  useEffect(() => {
    setTimeout(() => setValue(valueEnd), 900);
  }, [valueEnd]);

  return children(value);
};

const ProgressCircle = ({ value, max }: ProgressCircleProps) => {
  return (
    <div className="w-6 h-6">
      <ProgressProvider valueStart={0} valueEnd={value}>
        {(v: number) => (
          <CircularProgressbar
            value={v}
            maxValue={max}
            strokeWidth={16}
            styles={buildStyles({
              pathColor: 'var(--success-500)'
            })}
          />
        )}
      </ProgressProvider>
    </div>
  );
};

export default ProgressCircle;
