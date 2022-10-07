import Breadcrumb from '@components/atoms/Breadcrumb/Breadcrumb';
import StepWizard from '@components/atoms/StepWizard/StepWizard';

interface Crumbs {
  title: string;
  route: string;
}

interface Steps {
  title: string;
  desc: string;
}

interface SteppedLayoutProps extends React.AllHTMLAttributes<HTMLAllCollection> {
  title: string;
  crumbs: Crumbs[];
  steps: Steps[];
  currentStep: number;
}

const SteppedLayout = (props: SteppedLayoutProps) => {
  return (
    <div className="w-full">
      <div className="text-left mb-5">
        <Breadcrumb steps={props.crumbs} />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 max-w-6xl mx-auto">
        <h1 className="text-neutral-900 mb-10">{props.title}</h1>
        <StepWizard steps={props.steps} status={props.currentStep} />
        {props.children}
      </div>
    </div>
  );
};

export default SteppedLayout;
