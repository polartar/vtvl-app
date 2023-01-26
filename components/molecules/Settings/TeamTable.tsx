import Avatar from '@components/atoms/Avatar/Avatar';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import toDate from 'date-fns/toDate';
import { useMemo } from 'react';
import { ITeamRole, ITeamTableData } from 'types/models/settings';
import { convertLabelToOption, formatDate, formatTime } from 'utils/shared';

import Table from '../Table/Table';

const mockData = [
  {
    name: 'test',
    joinedAt: '2022/1/1',
    role: 'Founder',
    action: ''
  }
];

const CellName = ({ value, row, ...props }: any) => {
  return <div className="row-center">{value}</div>;
};

// Renderer for dates -- currently, the DB contains the start and end date in nanoseconds and seconds
const CellDate = ({ value }: any) => {
  return (
    <>
      {formatDate(toDate(value.toDate()))}
      <br />
      {formatTime(toDate(value.toDate()))}
    </>
  );
};
const CellRoles = ({ value }: any) => {
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  return <SelectInput options={roles} defaultValue={value} />;
};
const CellActions = ({ value }: any) => {
  return (
    <div className="flex">
      <button className="primary">Resend</button>
      <button className="text-[#ef4444] border border-[#ef4444]">Disable</button>
    </div>
  );
};
// const columns = useMemo(
//   () => [
//     {
//       id: 'name',
//       Header: 'Name',
//       accessor: 'data.name',
//       Cell: CellName
//     },
//     {
//       id: 'joined',
//       Header: 'Joined',
//       accessor: 'data.joinedAt',
//       Cell: CellDate
//     },
//     {
//       id: 'role',
//       Header: 'Roles',
//       accessor: 'data.role',
//       Cell: CellRoles
//     },

//     {
//       id: 'action',
//       Header: '',
//       accessor: 'action',
//       Cell: CellActions
//       //   getProps: () => ({
//       //     updateAlertStatus: (value: any, id: string) => {
//       //       // Save the update alert status to the DB
//       //       console.log('ALERT STATUS', value, id);
//       //     }
//       //   })
//     }
//   ],
//   []
// );
const TeamTable = ({ data }: { data: ITeamTableData[] }) => {
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  return (
    <table className="border-primary-200 border-2 w-full">
      <thead>
        <th>Team members</th>
        <th>Date joined</th>
        <th>Roles</th>
        <th className="flex items-center">
          <span className="mr-7">Action</span>
          <img src={'/icons/help.svg'} alt="help" />
        </th>
      </thead>

      <tbody>
        {data.map((row: ITeamTableData) => {
          return (
            <tr>
              <td className="flex items-center">
                <Avatar name={row.name} />
                <div className="flex flex-col ml-2 h-[40px]">
                  <span className=" font-medium">{row.name}</span>
                  <span className="  text-gray-400">{row.email}</span>
                </div>
              </td>

              <td>{row.joinedAt.toString()}</td>
              <td>
                <SelectInput options={roles} defaultValue={row.role} color="text-primary-800" />
              </td>

              <td>
                <button className="primary mr-1">Resend</button>
                <button className="border-[#ef4444] text-[#ef4444] border-2 font-medium">Disable</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TeamTable;
