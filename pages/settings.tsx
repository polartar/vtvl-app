import APIKeyPage from '@components/molecules/Settings/APIKey';
import GonsisSafe from '@components/molecules/Settings/GnosisSafe';
import Team from '@components/molecules/Settings/Team';
import { useAuthContext } from '@providers/auth.context';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { IRole, ITeamRole } from 'types/models/settings';

enum ETabs {
  TEAM = 'Team',
  SAFE = 'Gnosis Safe',
  KEY = 'API Key'
}
const Settings = () => {
  const router = useRouter();
  const { tab } = router?.query ?? {};

  const { user } = useAuthContext();
  const [currentTab, setCurrentTab] = useState<ETabs>(tab === 'safe' ? ETabs.SAFE : ETabs.TEAM);

  const isFounder = useMemo(() => {
    return user?.memberInfo?.role === IRole.FOUNDER;
  }, [user]);

  return (
    <>
      <h1 className="h2 font-semibold text-center mb-10">{currentTab}</h1>

      <div className="w-full justify-center flex border-t-[1px] border-b-[1px] border-gray-200 mb-12 font-medium">
        {Object.values(ETabs).map((tab: ETabs) => {
          return (
            <div
              key={tab}
              className={`flex items-center h-14 mr-13 ${
                currentTab === tab ? 'text-gray-800  border-b-[#2b298b] border-b-2' : 'text-gray-400'
              } cursor-pointer`}
              onClick={() => setCurrentTab(tab)}>
              {tab}
            </div>
          );
        })}
      </div>

      {isFounder ? (
        currentTab === ETabs.TEAM ? (
          <Team />
        ) : currentTab === ETabs.SAFE ? (
          <GonsisSafe />
        ) : (
          <APIKeyPage />
        )
      ) : (
        <div>You don't have access to this</div>
      )}
    </>
  );
};

export default Settings;
