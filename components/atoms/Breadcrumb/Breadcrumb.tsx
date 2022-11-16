import { Colors } from '@components/CommonStyles';
import styled from '@emotion/styled';
import Router from 'next/router';
import React, { Fragment } from 'react';

interface Props {
  steps: { title: string; route: string }[];
}

const Breadcrumb = ({ steps }: Props) => {
  function getSrc(item: string) {
    if (item === 'Dashboard') return '/icons/s_dashboard.svg';
    if (item === 'Vesting schedule') return '/icons/s_vestingSchedule.svg';
    if (item === 'Token performance') return '/icons/s_tokenPerformance.svg';
    if (item === 'Cap table') return '/icons/s_capTable.svg';
    if (item === 'Tokenomics') return '/icons/s_tokenomics.svg';
    if (item === 'Transactions') return '/icons/s_transactions.svg';
    else return '/icons/s_dashboard.svg';
  }
  return (
    <BreadcrumbContainer>
      <img src={getSrc(steps[0].title)} alt="start-icon" />
      {steps.map((step: { title: string; route: string }, index: number) => (
        <Fragment key={index}>
          <ChevronIcon src="/icons/chevron-down.svg" alt="next" />
          <StepLabel lastRoute={steps.length === index + 1} onClick={() => Router.push(step.route)}>
            {step.title}
          </StepLabel>
        </Fragment>
      ))}
    </BreadcrumbContainer>
  );
};

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
`;
const ChevronIcon = styled.img`
  rotate: -90deg;
  margin: 0 16px;
`;
const StepLabel = styled.span<{ lastRoute: boolean }>`
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: ${({ lastRoute }) => (lastRoute ? Colors.orange : Colors.grey)};
`;

export default Breadcrumb;
