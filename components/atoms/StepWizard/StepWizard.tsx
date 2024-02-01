import Tick from '@assets/tick.svg';
import { Colors } from '@components/CommonStyles';
import styled from '@emotion/styled';
import SuccessIcon from 'public/icons/success.svg';
import React from 'react';

type IStepWizardSize = 'tiny' | 'small' | 'default' | 'large';
interface Props {
  steps: { title: string; desc: string | string[] | JSX.Element | JSX.Element[] }[];
  status: number;
  size?: IStepWizardSize;
  className?: string;
  showAllLabels?: boolean;
}

const StepWizard = ({ steps, status, size = 'default', className = '', showAllLabels = false }: Props) => {
  return (
    <StepContainer className={className}>
      {steps.map((step, stepIndex) => (
        <StepItem key={stepIndex} isActive={status === stepIndex}>
          <DotWrapper size={size}>
            <LeftBorder cl={stepIndex} isActive={status >= stepIndex} size={size} />
            <Circle isActive={status > stepIndex} isLast={stepIndex + 1 === steps.length} size={size}>
              {status <= stepIndex && status < steps.length ? (
                <>{size !== 'tiny' && size !== 'small' ? <Dot isActive={status === stepIndex} /> : null}</>
              ) : (
                <>
                  {size !== 'tiny' && size !== 'small' ? (
                    <Tick fill={steps.length === stepIndex + 1 ? 'var(--success-500)' : 'var(--primary-900)'} />
                  ) : (
                    <div className="text-success-500">
                      <SuccessIcon className="fill-current" />
                    </div>
                  )}
                </>
              )}
            </Circle>
            <RightBorder cl={stepIndex + 1 < steps.length ? 1 : 0} isActive={status > stepIndex} size={size} />
          </DotWrapper>
          <Title isActive={status === stepIndex}>{step.title}</Title>
          {status >= stepIndex || (showAllLabels && step.desc) ? (
            <Description isActive={status === stepIndex}>{step.desc}</Description>
          ) : null}
        </StepItem>
      ))}
    </StepContainer>
  );
};

const StepContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const StepItem = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  div {
    font-style: normal;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
  }
`;
const DotWrapper = styled.div<{ size: IStepWizardSize }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ size }) => (size === 'tiny' ? '' : 'margin-bottom: 14px;')}
`;
const LeftBorder = styled.hr<{ cl: number; isActive: boolean; size: IStepWizardSize }>`
  width: ${({ size }) => (size === 'tiny' ? '8px' : size === 'small' ? '90px' : '112px')};
  border: none;
  border-top: 2px solid
    ${({ cl, isActive, size }) =>
      cl ? (isActive && size !== 'tiny' ? 'var(--primary-900)' : 'var(--neutral-200)') : 'transparent'};
`;
const RightBorder = styled(LeftBorder)`
  border-color: ${({ cl, isActive, size }) =>
    cl ? (isActive && size !== 'tiny' ? 'var(--primary-900)' : 'var(--neutral-200)') : 'transparent'};
`;
const Circle = styled.div<{ isActive: boolean; isLast: boolean; size: IStepWizardSize }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ isActive, isLast, size }) =>
    isActive && size !== 'tiny' ? (isLast ? 'var(--success-100)' : 'var(--neutral-100)') : 'white'};
  border: 1.5px solid
    ${({ isActive, isLast, size }) =>
      isActive && size !== 'tiny' ? (isLast ? 'var(--success-500)' : 'var(--primary-900)') : 'var(--neutral-200)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Dot = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? 'var(--primary-900)' : 'var(--neutral-200)')};
`;
const Title = styled.div<{ isActive: boolean }>`
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? 'var(--primary-900)' : 'var(--secondary-900)')};
`;
const Description = styled.div<{ isActive: boolean }>`
  font-weight: 400;
  color: ${({ isActive }) => (isActive ? 'var(--primary-900)' : 'var(--gray-500)')};
`;

export default StepWizard;
