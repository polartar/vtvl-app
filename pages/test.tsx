import Button from '@components/atoms/Button/Button';
import { useAuthContext } from '@providers/auth.context';
import { NextPage } from 'next';
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
      <div className="flex flex-row items-center gap-2">
        <h5>Send invite to BICO managers</h5>
        <Button className="secondary" loading={sending} onClick={handleSendInvite}>
          Invite
        </Button>
      </div>
    </div>
  );
};

export default TestPage;
