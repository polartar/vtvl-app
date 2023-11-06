import { Typography } from '@components/atoms/Typography/Typography';
import useSafePush from '@hooks/useSafePush';
import { useAuthContext } from '@providers/auth.context';
import { useEffect, useState } from 'react';
import { IRole } from 'types/models/settings';

const SwitchRole = () => {
  const { user, switchRole } = useAuthContext();
  const { safePush } = useSafePush();
  const [newRole, setNewRole] = useState<IRole>(IRole.ANONYMOUS);

  useEffect(() => {
    if (user?.memberInfo?.role === IRole.FOUNDER) {
      setNewRole((newRole ? '' : IRole.FOUNDER) as IRole);
    }
  }, [user?.memberInfo?.role]);

  const handleSwitchRole = () => {
    switchRole(newRole);
    // Add some redirects here
    safePush('/claim-portal');
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
        <button className="primary line" onClick={() => safePush('/dashboard')}>
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
