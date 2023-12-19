import Hint from '../Hint/Hint';
import { Typography } from '../Typography/Typography';

interface CardProps {
  title: string;
  value: string;
  info?: string;
  content?: JSX.Element;
}

const Card = ({ title, value, info, content, ...props }: CardProps) => {
  return (
    <div className="px-3 py-2 rounded-lg border border-primary-50 grow min-h-[60px] font-medium">
      <div className="flex flex-row items-center gap-1.5">
        <Typography size="caption" className="text-neutral-500">
          {title}
        </Typography>
        {content ?? null}
        {info && <Hint tip={info} />}
      </div>
      <div>
        <Typography size="paragraph" className="text-neutral-900">
          {value}
        </Typography>
      </div>
    </div>
  );
};

export default Card;
