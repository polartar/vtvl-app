import Chip from '@components/atoms/Chip/Chip';

interface IImportStepProps {
  title?: string | string[] | JSX.Element | JSX.Element[];
  step?: number;
  steps?: number;
  description?: string | string[] | JSX.Element | JSX.Element[];
  content: string | string[] | JSX.Element | JSX.Element[];
  actions?: string | string[] | JSX.Element | JSX.Element[];
  className?: string;
}

const ImportStep = ({
  title = '',
  step,
  steps,
  description = '',
  content,
  actions,
  className,
  ...props
}: IImportStepProps) => {
  return (
    <div className={`text-neutral-500 max-w-lg w-full mx-auto ${className}`}>
      {title ? (
        <div className="flex flex-row items-center gap-3 mb-1">
          <h2 className="h5 font-medium inter text-neutral-900">{title}</h2>
          <Chip label={`${step} of ${steps}`} rounded size="small" color="gray" />
        </div>
      ) : null}
      {description ? <p className="mb-5 text-sm">{description}</p> : null}
      {content ?? null}
      {actions ? <div className="flex flex-row justify-between items-center gap-3 mt-5">{actions}</div> : null}
    </div>
  );
};

export default ImportStep;
