import { twMerge } from 'tailwind-merge';

interface IStepProgressProps {
  steps: number;
  value: number;
}

const StepProgress = ({ steps, value }: IStepProgressProps) => {
  return (
    <div
      className={twMerge(
        'flex flex-row items-center h-2.5 border rounded-xl overflow-hidden',
        value === steps ? 'border-success-600' : 'border-neutral-300'
      )}>
      {Array.from(Array(steps).keys()).map((step, index) => {
        return (
          <div
            key={index}
            className={twMerge(
              'h-2.5 w-full transition-all',
              index < value ? 'bg-success-500' : 'bg-white',
              index && 'border-l',
              index && index < value + 1 ? 'border-success-600' : 'border-neutral-300'
            )}></div>
        );
      })}
    </div>
  );
};

export default StepProgress;
