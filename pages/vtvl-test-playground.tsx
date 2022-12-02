import Button from '@components/atoms/Button/Button';
import { useAuthContext } from '@providers/auth.context';
import { NextPage } from 'next';
import Router from 'next/router';
import { useState } from 'react';

const TestPage: NextPage = () => {
  const { sendTeammateInvite } = useAuthContext();
  const [sending, setSending] = useState(false);
  const handleSendInvite = async () => {
    // (email: string, type: string, userName: string, orgName: string, orgId?: string)
    setSending(true);
    // PROD
    await sendTeammateInvite('purva.gera@biconomy.io', 'manager', 'Purva', 'Biconomy', 'ggDbYxw5UtoeRNnUwPMm');
    await sendTeammateInvite('ahmed@biconomy.io', 'manager', 'Ahmed', 'Biconomy', 'ggDbYxw5UtoeRNnUwPMm');
    await sendTeammateInvite('arshita@biconomy.io', 'manager', 'Arshita', 'Biconomy', 'ggDbYxw5UtoeRNnUwPMm');
    await sendTeammateInvite('aniket@biconomy.io', 'manager', 'Aniket', 'Biconomy', 'ggDbYxw5UtoeRNnUwPMm');
    // QA TEST
    // await sendTeammateInvite('nisha@vtvl.io', 'manager', 'Nisha', '1129test', 'nrHTFmzrofiHSlSqUdFH');
    setSending(false);
  };
  return (
    <div className="text-left p-10 w-full">
      <h5>Send invite to BICO managers</h5>
      <p className="text-sm text-gray-500 mb-3">
        This will send an invite link to Purva, Ahmed, Arshita and Aniket from BICO. Todo: Update this into a dynamic
        form, for OPS utility.
      </p>
      <div className="flex flex-row items-center gap-2 mb-10">
        <Button className="secondary" loading={sending} onClick={handleSendInvite}>
          Invite
        </Button>
      </div>

      <h5>Test sidebar redirect to dashboard</h5>
      <p className="text-sm text-gray-500 mb-3">
        Force display the sidebar in the <strong>DefaultLayout.tsx</strong> component
      </p>
      <div className="flex flex-row items-center gap-2 mb-10">
        <Button className="secondary" loading={sending} onClick={() => Router.push('/dashboard')}>
          Go to dashboard
        </Button>
        <Button className="secondary" loading={sending} onClick={() => Router.push('/vesting-schedule')}>
          Go to vesting schedules
        </Button>
        <Button className="secondary" loading={sending} onClick={() => Router.push('/cap-table')}>
          Go to cap table
        </Button>
        <Button className="secondary" loading={sending} onClick={() => Router.push('/onboarding/setup-safes')}>
          Go to connect safe
        </Button>
      </div>
    </div>
  );
};

export default TestPage;
