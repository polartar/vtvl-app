import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Recipient from '@components/organisms/Recipient';
import { NextPageWithLayout } from 'pages/_app';
import React from 'react';

const RecipientPage: NextPageWithLayout = () => {
  return <Recipient />;
};

RecipientPage.getLayout = function getLayout(page: React.ReactElement) {
  const crumbSteps = [{ title: 'Recipients', route: `/recipient` }];
  return (
    <SteppedLayout title="Recipients" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default RecipientPage;
