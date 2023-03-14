import Breadcrumb from '@components/atoms/Breadcrumb/Breadcrumb';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import React from 'react';

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
  steps?: Steps[];
  currentStep?: number;
  padded?: boolean;
}

const SteppedLayout = ({ steps = [], currentStep = -1, padded = true, ...props }: SteppedLayoutProps) => {
  return (
    <div className="w-full h-full">
      <div className="text-left mb-5 px-8">
        <Breadcrumb steps={props.crumbs} />
      </div>
      <div
        className={`flex flex-col items-center justify-center gap-4 mx-auto w-full h-full ${
          padded ? 'px-8 pb-8' : ''
        }`}>
        {steps?.length && currentStep > -1 ? (
          <>
            <h1 className="h2 text-neutral-900 mb-10">{props.title}</h1>
            <div className="mb-10">
              <StepWizard steps={steps} status={currentStep} />
            </div>
          </>
        ) : null}
        {props.children}
      </div>
    </div>
  );
};

export default SteppedLayout;
