import ClaimPortal from '@components/organisms/ClaimPortal';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import React from 'react';

import { NextPageWithLayout } from './_app';

const ClaimPortalPage: NextPageWithLayout = () => {
  return <ClaimPortal />;
};

const crumbSteps = [{ title: 'Claims Portal', route: '/claim-portal' }];

ClaimPortalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <SteppedLayout title="Claims Portal" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ClaimPortalPage;
