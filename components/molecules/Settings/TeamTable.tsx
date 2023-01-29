import Avatar from '@components/atoms/Avatar/Avatar';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { useAuthContext } from '@providers/auth.context';
import format from 'date-fns/format';
import { useModal } from 'hooks/useModal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { IMember } from 'types/models';
import { ITeamRole } from 'types/models/settings';
import { convertLabelToOption } from 'utils/shared';

import RevokeModalContainer from './RevokeModalContainer';

const TeamTable = ({
  data,
  companyName,
  isDisableAvailable
}: {
  data: IMember[];
  companyName: string;
  isDisableAvailable: boolean;
}) => {
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  const { user, sendTeammateInvite } = useAuthContext();
  const { ModalWrapper, open, showModal, hideModal } = useModal({});
  const [selectedMember, setSelectedMember] = useState<IMember>({});

  const resend = async (member: IMember) => {
    if (!member.email || !user) return;
    try {
      await sendTeammateInvite(
        member.email,
        member.type || 'anonymous',
        'member.name',
        companyName,
        user.memberInfo?.org_id
      );
      toast.success('Resent email successfully');
    } catch (err) {
      toast.error('Something went wrong while resending email');
    }
  };

  const onDisableClick = (member: IMember) => {
    setSelectedMember(member);
    showModal();
  };
  return (
    <>
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
          {data &&
            data.map((row: IMember) => {
              return (
                <tr>
                  <td className="flex items-center">
                    <Avatar name={row.name || ''} />
                    <div className="flex flex-col ml-2 h-[40px]">
                      <span className=" font-medium">{row.name}</span>
                      <span className="  text-gray-400">{row.email}</span>
                    </div>
                  </td>

                  <td>{row.createdAt ? format(new Date(row.createdAt * 1000), 'MMMM d, yyyy') : ''}</td>
                  <td>
                    <SelectInput options={roles} defaultValue={row.type} color="text-primary-800" />
                  </td>

                  <td>
                    <button className="primary mr-1" onClick={() => resend(row)}>
                      Resend
                    </button>
                    <button
                      className="border-[#ef4444] text-[#ef4444] border-2 font-medium"
                      disabled={!isDisableAvailable}
                      onClick={() => onDisableClick(row)}>
                      Disable
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <ModalWrapper>
        <RevokeModalContainer hideModal={hideModal} member={selectedMember} />
      </ModalWrapper>
    </>
  );
};

export default TeamTable;
