import Tick from '@assets/tick.svg';
import { Colors } from '../../CommonStyles';
import styled from '@emotion/styled';
import React from 'react';

interface Props {
  steps: { title: string; desc: string }[];
  status: number;
}

const StepWizard = ({ steps, status }: Props) => {
  return (
    <StepContainer>
      {steps.map((step, stepIndex) => (
        <StepItem key={stepIndex} isActive={status === stepIndex}>
          <DotWrapper>
            <LeftBorder cl={stepIndex} isActive={status >= stepIndex} />
            <Circle isActive={status >= stepIndex} isLast={stepIndex + 1 === steps.length}>
              {status <= stepIndex && status < steps.length - 1 ? (
                <Dot isActive={status === stepIndex} />
              ) : (
                <Tick fill={steps.length === stepIndex + 1 ? Colors.success : Colors.primary} />
              )}
            </Circle>
            <RightBorder cl={stepIndex + 1 < steps.length ? 1 : 0} isActive={status > stepIndex} />
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
    font-family: 'Inter';
    font-style: normal;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
  }
`;
const DotWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 14px;
`;
const LeftBorder = styled.hr<{ cl: number; isActive: boolean }>`
  width: 112px;
  border: none;
  border-top: 2px solid ${({ cl, isActive }) => (cl ? (isActive ? Colors.primary : Colors.border) : 'transparent')};
`;
const RightBorder = styled(LeftBorder)`
  border-color: ${({ cl, isActive }) => (cl ? (isActive ? Colors.primary : Colors.border) : 'transparent')};
`;
const Circle = styled.div<{ isActive: boolean; isLast: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ isActive, isLast }) => (isActive ? (isLast ? Colors.successBg : Colors.stepBg) : 'white')};
  border: 1.5px solid
    ${({ isActive, isLast }) => (isActive ? (isLast ? Colors.success : Colors.primary) : Colors.border)};
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
