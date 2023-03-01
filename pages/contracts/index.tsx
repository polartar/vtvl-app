import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Contracts from '@components/organisms/VestingContracts/VestingContracts';
import React from 'react';

import { NextPageWithLayout } from '../_app';

const ContractsPage: NextPageWithLayout = () => {
  return <Contracts />;
};

const crumbSteps = [{ title: 'Contracts', route: '/contracts' }];

ContractsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <SteppedLayout title="Contracts" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ContractsPage;
