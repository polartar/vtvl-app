import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressCircleProps {
  value: number;
  max: number;
}

const ProgressCircle = ({ value, max }: ProgressCircleProps) => {
  return (
    <div className="w-6 h-6">
      <CircularProgressbar
        value={value}
        maxValue={max}
        strokeWidth={16}
        styles={buildStyles({
          pathColor: 'var(--success-500)'
        })}
      />
    </div>
  );
};

export default ProgressCircle;
