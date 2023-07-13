import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { IUserType } from 'types/models/member';
import { IRole } from 'types/models/settings';

const SwitchRole = () => {
  const { user, switchRole } = useAuthContext();
  const [newRole, setNewRole] = useState<IRole>(IRole.ANONYMOUS);

  useEffect(() => {
    if (user?.memberInfo?.role === IRole.FOUNDER) {
      setNewRole((newRole ? '' : IRole.FOUNDER) as IRole);
    }
  }, [user?.memberInfo?.role]);

  const handleSwitchRole = () => {
    switchRole(newRole);
    // Add some redirects here
    Router.push('/claim-portal');
  };

  return (
    <div className="max-w-lg mx-auto pt-12 text-center">
      <Typography size="title" className="font-semibold">
        Switch to <span className="capitalize">{newRole || 'founder'}</span>
      </Typography>
      <Typography size="paragraph" className="mt-4">
        Switching to <strong className="capitalize">{newRole || 'founder'}</strong> will change your current experience
        that will enable you to {newRole.includes('investor') ? 'check for your claimable' : 'manage your'} tokens.
      </Typography>
      <div className="flex flex-row items-center justify-center gap-2 mt-6">
        <button className="primary line" onClick={() => Router.push('/dashboard')}>
          Cancel
        </button>
        <button className="secondary" onClick={handleSwitchRole}>
          Switch to {newRole || 'founder'}
        </button>
      </div>
    </div>
  );
};

export default SwitchRole;
