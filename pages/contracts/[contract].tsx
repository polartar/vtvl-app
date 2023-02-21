import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Contract from '@components/organisms/VestingContracts/VestingContract';
import useVestingContract from 'hooks/useVestingContract';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import React from 'react';

const ContractsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const contractId = router.query.contract;
  return <Contract vestingContractId={contractId as string} />;
};

ContractsPage.getLayout = function getLayout(page: React.ReactElement) {
  const router = useRouter();
  const contractId = router.query.contract;
  const vestingContract = useVestingContract(contractId as string);

  const crumbSteps = [
    { title: 'Contracts', route: '/contracts' },
    { title: vestingContract?.data.name || 'Vesting contract', route: `/contracts/${contractId}` }
  ];
  return (
    <SteppedLayout title="Contracts" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default ContractsPage;
