import Team from '@components/molecules/Settings/Team';
import { useState } from 'react';

const Settings = () => {
  const [isTeam, setIsTeam] = useState(true);
  return (
    <>
      <h1 className="h2 font-semibold text-center mb-10">Team Management</h1>

      <div className="w-full flex border-t-[1px] border-b-[1px] border-gray-200 mb-12">
        <div className="w-[400px] h-1"></div>

        <div className="pl-4 flex items-center font-medium">
          <div
            className={`flex items-center h-14 mr-13 ${
              isTeam ? 'text-gray-800  border-b-[#2b298b] border-b-2' : 'text-gray-400'
            } cursor-pointer`}
            onClick={() => setIsTeam(true)}>
            Team
          </div>

          <div
            className={`flex items-center h-14 ${
              isTeam ? 'text-gray-400 ' : 'text-gray-800 border-b-[#2b298b] border-b-2'
            } cursor-pointer`}
            onClick={() => setIsTeam(false)}>
            Gnosis Safe
          </div>
        </div>
      </div>

      <Team />
    </>
  );
};

export default Settings;
