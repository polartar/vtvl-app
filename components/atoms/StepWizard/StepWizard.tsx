import Tick from '@assets/tick.svg';
import { Colors } from '@components/CommonStyles';
import styled from '@emotion/styled';
import SuccessIcon from 'public/icons/success.svg';
import React from 'react';

type IStepWizardSize = 'tiny' | 'small' | 'default' | 'large';
interface Props {
  steps: { title: string; desc: string }[];
  status: number;
  size?: IStepWizardSize;
}

const StepWizard = ({ steps, status, size = 'default' }: Props) => {
  console.log({ steps, status });
  return (
    <StepContainer>
      {steps.map((step, stepIndex) => (
        <StepItem key={stepIndex} isActive={status === stepIndex}>
          <DotWrapper size={size}>
            <LeftBorder cl={stepIndex} isActive={status >= stepIndex} size={size} />
            <Circle isActive={status > stepIndex} isLast={stepIndex + 1 === steps.length} size={size}>
              {status <= stepIndex && status < steps.length - 1 ? (
                size !== 'tiny' ? (
                  <Dot isActive={status === stepIndex} />
                ) : null
              ) : size === 'tiny' ? (
                <div className="text-success-500">
                  <SuccessIcon className="fill-current" />
                </div>
              ) : (
                <Tick fill={steps.length === stepIndex + 1 ? Colors.success : Colors.primary} />
              )}
            </Circle>
            <RightBorder cl={stepIndex + 1 < steps.length ? 1 : 0} isActive={status > stepIndex} size={size} />
          </DotWrapper>
          <Title isActive={status === stepIndex}>{step.title}</Title>
          {status >= stepIndex ? <Description isActive={status === stepIndex}>{step.desc}</Description> : null}
        </StepItem>
      ))}
    </StepContainer>
  );
};

const StepContainer = styled.div`
  display: flex;
  flex-direction: row;
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
  width: ${({ size }) => (size === 'tiny' ? '8px' : '112px')};
  border: none;
  border-top: 2px solid
    ${({ cl, isActive, size }) => (cl ? (isActive && size !== 'tiny' ? Colors.primary : Colors.border) : 'transparent')};
`;
const RightBorder = styled(LeftBorder)`
  border-color: ${({ cl, isActive, size }) =>
    cl ? (isActive && size !== 'tiny' ? Colors.primary : Colors.border) : 'transparent'};
`;
const Circle = styled.div<{ isActive: boolean; isLast: boolean; size: IStepWizardSize }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ isActive, isLast, size }) =>
    isActive && size !== 'tiny' ? (isLast ? Colors.successBg : Colors.stepBg) : 'white'};
  border: 1.5px solid
    ${({ isActive, isLast, size }) =>
      isActive && size !== 'tiny' ? (isLast ? Colors.success : Colors.primary) : Colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Dot = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? Colors.primary : Colors.border)};
`;
const Title = styled.div<{ isActive: boolean }>`
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? Colors.primary : Colors.secondary)};
`;
const Description = styled.div<{ isActive: boolean }>`
  font-weight: 400;
  color: ${({ isActive }) => (isActive ? Colors.primary : Colors.grey)};
`;

export default StepWizard;
