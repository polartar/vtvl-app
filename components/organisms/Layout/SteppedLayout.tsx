import Breadcrumb from '@components/atoms/Breadcrumb/Breadcrumb';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import React, { useEffect, useState } from 'react';

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
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWidth(window.outerWidth);
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWidth]);
  return (
    <div className="w-full h-full">
      <div className="text-left mb-5 px-6">
        <Breadcrumb steps={props.crumbs} />
      </div>
      <div
        className={`flex flex-col items-center justify-center gap-4 mx-auto w-full h-full ${
          padded ? 'px-6 pb-8' : ''
        }`}>
        {steps?.length && currentStep > -1 ? (
          <>
            <h1 className="h2 text-neutral-900 mb-10">{props.title}</h1>
            <div className="mb-10">
              <StepWizard
                steps={steps}
                status={currentStep}
                size={width > 1500 ? 'large' : width > 1000 ? 'default' : width > 800 ? 'small' : 'tiny'}
              />
            </div>
          </>
        ) : null}
        {props.children}
      </div>
    </div>
  );
};

export default SteppedLayout;
