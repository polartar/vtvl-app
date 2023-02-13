import Avatar from '@components/atoms/Avatar/Avatar';
import Button from '@components/atoms/Button/Button';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { useAuthContext } from '@providers/auth.context';
import format from 'date-fns/format';
import { useModal } from 'hooks/useModal';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { removeInvite, removeMember } from 'services/db/member';
import { IMember } from 'types/models';
import { ITeamRole } from 'types/models/settings';
import { INVITEE_EXPIRED_TIME } from 'utils/constants';
import { convertLabelToOption } from 'utils/shared';

import ResendModalContainer from './ResendModalContainer';
import RevokeModalContainer from './RevokeModalContainer';

const TeamTable = ({
  data,
  companyName,
  isDisableAvailable,
  isTeamMember
}: {
  data: IMember[];
  companyName: string;
  isDisableAvailable: boolean;
  isTeamMember: boolean;
}) => {
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  const { user, sendTeammateInvite } = useAuthContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});
  const [isResend, setIsResend] = useState(true);
  const [tableData, setTableData] = useState<IMember[]>([]);

  const [selectedMember, setSelectedMember] = useState<IMember>({});

  useEffect(() => {
    setTableData(data.slice());
  }, [isTeamMember, data]);

  const disableMember = useCallback(async () => {
    if (selectedMember.id) {
      hideModal();

      if (isTeamMember) {
        await removeMember(selectedMember.id);
      } else {
        await removeInvite(selectedMember.id);
      }
    }
  }, [selectedMember]);

  const resendMember = useCallback(async () => {
    if (!selectedMember.email || !user) return;
    try {
      hideModal();

      await sendTeammateInvite(
        selectedMember.email,
        selectedMember.type || ITeamRole.Manager,
        selectedMember.name || 'anonymous',
        companyName,
        user.memberInfo?.org_id,
        selectedMember.id
      );
      toast.success('Resent email successfully');
    } catch (err) {
      toast.error('Something went wrong while resending email');
    }
  }, [selectedMember, user]);

  const onResendClick = (member: IMember) => {
    setIsResend(true);
    setSelectedMember(member);
    showModal();
  };

  const onDisableClick = (member: IMember) => {
    setIsResend(false);
    setSelectedMember(member);
    showModal();
  };

  const isPending = (inviteDate: number | undefined) => {
    if (inviteDate === undefined) return false;
    const currentTime = new Date().getTime() / 1000;

    return currentTime < INVITEE_EXPIRED_TIME + inviteDate;
  };

  const onChangeType = (id: string | undefined, value: ITeamRole) => {
    const tmpData = tableData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          type: value
        };
      }
      return row;
    });

    setTableData(tmpData.slice());
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-primary-200 border-2 w-full">
        <thead>
          <tr>
            <th>Team members</th>
            <th>{`${isTeamMember ? 'Date joined' : 'Date Invited'}`}</th>
            <th>Roles</th>
            {!isTeamMember && <th>Status</th>}
            <th className="flex items-center">
              <span className="mr-7">Action</span>
              <img src={'/icons/help.svg'} alt="help" />
            </th>
          </tr>
        </thead>

        <tbody>
          {tableData &&
            tableData.map((row: IMember) => {
              return (
                <tr key={row.id}>
                  <td className="flex items-center">
                    <Avatar name={row.name || row.email?.split('@')[0] || ''} />
                    <div className="flex flex-col ml-2 h-[40px]">
                      <span className=" font-medium">{row.name || row.email?.split('@')[0]}</span>
                      <span className="  text-gray-400">{row.email}</span>
                    </div>
                  </td>

                  <td>{row.createdAt ? format(new Date(row.createdAt * 1000), 'MMMM d, yyyy') : ''}</td>
                  <td>
                    <SelectInput
                      options={roles}
                      value={row.type}
                      color="text-primary-800"
                      onChange={(e) => onChangeType(row.id, e.target.value as ITeamRole)}
                    />
                  </td>

                  {!isTeamMember && (
                    <td>
                      {isPending(row.createdAt) ? (
                        <Button className="text-[#98a2b3] cursor-default">Pending</Button>
                      ) : (
                        <Button className="text-[#ff5c00] cursor-default">Expired</Button>
                      )}
                    </td>
                  )}

                  <td className="flex items-center justify-around">
                    <button className="primary mr-1" onClick={() => onResendClick(row)}>
                      {`${isTeamMember ? 'Resend' : 'Resend invite'}`}
                    </button>
                    {isTeamMember ? (
                      <button
                        className="border-[#ef4444] text-[#ef4444] border-2 font-medium"
                        disabled={!isDisableAvailable && row.type === ITeamRole.Founder}
                        onClick={() => onDisableClick(row)}>
                        Disable
                      </button>
                    ) : (
                      <img
                        src="/icons/trash.svg"
                        alt={`Remove `}
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => onDisableClick(row)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <ModalWrapper>
        {isResend ? (
          <ResendModalContainer hideModal={hideModal} resendInvite={resendMember} />
        ) : (
          <RevokeModalContainer
            hideModal={hideModal}
            memberName={selectedMember.name}
            disableMember={disableMember}
            isDisable={isTeamMember}
          />
        )}
      </ModalWrapper>
    </div>
  );
};

export default TeamTable;
