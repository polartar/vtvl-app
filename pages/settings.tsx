import Team from '@components/molecules/Settings/Team';
import { useAuthContext } from '@providers/auth.context';
import { useEffect, useMemo, useState } from 'react';
import { ITeamRole } from 'types/models/settings';

const Settings = () => {
  const [isTeamPage, setIsTeamPage] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user?.memberInfo?.type !== ITeamRole.Founder) {
      setIsTeamPage(false);
    }
  }, [user]);

  const isFounder = useMemo(() => {
    return user?.memberInfo?.type === ITeamRole.Founder;
  }, [user]);
  return (
    <>
      <h1 className="h2 font-semibold text-center mb-10">{`${isTeamPage ? 'Team Management' : 'Gnosis Safe'}`}</h1>

      <div className="w-full flex border-t-[1px] border-b-[1px] border-gray-200 mb-12">
        <div className="w-[400px] h-1"></div>

        <div className="pl-4 flex items-center font-medium">
          <div
            className={`flex items-center h-14 mr-13 ${
              isTeamPage ? 'text-gray-800  border-b-[#2b298b] border-b-2' : 'text-gray-400'
            } cursor-pointer`}
            onClick={() => setIsTeamPage(true)}>
            Team
          </div>

          <div
            className={`flex items-center h-14 ${
              isTeamPage ? 'text-gray-400 ' : 'text-gray-800 border-b-[#2b298b] border-b-2'
            } cursor-pointer`}
            onClick={() => setIsTeamPage(false)}>
            Gnosis Safe
          </div>
        </div>
      </div>

      {isTeamPage ? isFounder ? <Team /> : <div>You don't have access to this</div> : <div>Coming soon</div>}
    </>
  );
};

export default Settings;
