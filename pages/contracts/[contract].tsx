import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Contract from '@components/organisms/VestingContracts/VestingContract';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import React from 'react';
import { fetchVestingContract } from 'services/db/vestingContract';
import useSWR from 'swr';

const ContractsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const contractId = router.query.contract;
  const { data: vestingContract } = useSWR(['fetch', contractId], async () => {
    if (contractId) return await fetchVestingContract(contractId as string);
    return undefined;
  });

  const crumbSteps = [
    { title: 'Contracts', route: '/contracts' },
    { title: vestingContract?.name || 'Vesting contract', route: `/contracts/${contractId}` }
  ];
  return (
    <SteppedLayout title="Contracts" crumbs={crumbSteps}>
      <Contract vestingContractId={contractId as string} />;
    </SteppedLayout>
  );
};

export default ContractsPage;
