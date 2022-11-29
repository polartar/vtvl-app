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
    await sendTeammateInvite('nisha@vtvl.io', 'manager', 'Nisha', '1129test', 'nrHTFmzrofiHSlSqUdFH');
    setSending(false);
  };
  return (
    <div className="text-left p-10 w-full">
      <div className="flex flex-row items-center gap-2">
        <h5>Send invite to Nisha</h5>
        <Button className="secondary" loading={sending} onClick={handleSendInvite}>
          Invite
        </Button>
      </div>
    </div>
  );
};

export default TestPage;
