import capTableIcon from '@assets/s_capTable.svg';
import dashboardIcon from '@assets/s_dashboard.svg';
import tokenPerformanceIcon from '@assets/s_tokenPerformance.svg';
import tokenomicsIcon from '@assets/s_tokenomics.svg';
import transactionsIcon from '@assets/s_transactions.svg';
import vestingScheduleIcon from '@assets/s_vestingSchedule.svg';
import { Colors } from '@components/CommonStyles';
import styled from '@emotion/styled';
import React from 'react';

import chevrondown from '../../../assets/chevron-down.svg';

interface Props {
  steps: { title: string; route: string }[];
}

export const Breadcrumb = ({ steps }: Props) => {
  function getSrc(item: string) {
    if (item === 'Dashboard') return dashboardIcon;
    if (item === 'Vesting schedule') return vestingScheduleIcon;
    if (item === 'Token performance') return tokenPerformanceIcon;
    if (item === 'Cap table') return capTableIcon;
    if (item === 'Tokenomics') return tokenomicsIcon;
    if (item === 'Transactions') return transactionsIcon;
    else return dashboardIcon;
  }
  return (
    <BreadcrumbContainer>
      <img src={getSrc(steps[0].title)} alt="start-icon" />
      {steps.map((step: { title: string; route: string }, index: number) => (
        <>
          <ChevronIcon src={chevrondown} alt="next" />
          <StepLabel lastRoute={steps.length === index + 1}>{step.title}</StepLabel>
        </>
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
