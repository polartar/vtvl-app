import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '@providers/auth.context';
import { useTeammateContext } from '@providers/teammate.context';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addInvitee } from 'services/db/member';
import { fetchOrg } from 'services/db/organization';
import { IInvitee, IMember } from 'types/models';
import { ITeamManagement, ITeamRole } from 'types/models/settings';
import { convertLabelToOption } from 'utils/shared';
import * as Yup from 'yup';

import TeamTable from './TeamTable';

const defaultRecipientValues: ITeamManagement = {
  name: '',
  email: '',
  role: ITeamRole.Founder
};

const VALID_EMAIL_REG =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Team = () => {
  const { user, sendTeammateInvite } = useAuthContext();
  const [isTeamMemberClicked, setIsTeamMemberClicked] = useState(true);
  const { teammates, pendingTeammates } = useTeammateContext();
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const getCompanyName = async () => {
      if (user?.memberInfo?.org_id) {
        const org = await fetchOrg(user.memberInfo.org_id);
        if (org?.name) {
          setCompanyName(org?.name);
        }
      }
    };

    getCompanyName();
  }, [user]);

  const isMemberDisableAvailable = useMemo(() => {
    return teammates.filter((member: IMember) => member.type === ITeamRole.Founder).length > 1;
  }, [teammates]);

  const inviteMember = async (data: ITeamManagement) => {
    if (user?.memberInfo?.org_id) {
      try {
        const invitee: IInvitee = {
          org_id: user?.memberInfo?.org_id,
          name: data.name,
          email: data.email
        };
        await sendTeammateInvite(data.email, data.role, data.name, companyName, user.memberInfo?.org_id);
        await addInvitee(invitee);

        toast.success('Invited email successfully');
      } catch (err: any) {
        toast.error('Something went wrong. ' + err.message);
      }
    }
  };

  const addMoreMember = (data: ITeamManagement) => console.log(data);
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  const validationSchema = Yup.object()
    .strict(false)
    .shape({
      name: Yup.string()
        .required('Team member name is required')
        .min(2, 'Team member name must contain at least two characters')
        .max(100, 'Team member name must contain less than 100 characters'),
      email: Yup.string()
        .required('Email is required')
        .max(100, 'Email must contain less than 100 characters')
        .matches(VALID_EMAIL_REG, 'Enter a valid email')
    });
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: defaultRecipientValues, resolver: yupResolver(validationSchema) });

  return (
    <div className="flex w-full">
      <div className="w-[400px] ml-6">
        <h1 className="h2 font-normal ">Members</h1>
        <p className=" text-gray-500 text-sm">Invite team members to your organization</p>
      </div>

      <div className="w-full pr-4">
        <form
          className="grid md:grid-cols-3 gap-5 border-b border-t py-5 border-neutral-300 my-5"
          onSubmit={handleSubmit(inviteMember)}>
          <Controller
            name="name"
            control={control}
            // rules={{ required: true, min: 2, max: 100 }}
            render={({ field }) => (
              <Input
                label="Name"
                placeholder="Enter name (optional)"
                error={Boolean(errors.name)}
                message={errors.name ? errors.name.message : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="Enter email"
                required
                error={Boolean(errors.email)}
                message={errors.email ? errors.email.message : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <label className="required ">
                <span>Role</span>
                <SelectInput options={roles} {...field} />
              </label>
            )}
          />
          <div className="md:col-span-3 flex justify-between">
            <div className="py-1 text-secondary-900 cursor-pointer" onClick={handleSubmit(addMoreMember)}>
              {' '}
              + Add more members
            </div>
            <button type="submit" className="secondary py-1">
              + Send invite
            </button>
          </div>
        </form>

        <div className=" flex items-center font-medium  ">
          <div
            className={`flex items-center w-[252px] h-14 pl-6 tx-sm font-medium border-primary-200 border-r-primary-900 ${
              isTeamMemberClicked ? ' bg-primary-50 text-primary-900  border-2' : 'text-gray-400   border'
            } cursor-pointer rounded-tl-xl border-b-0`}
            onClick={() => setIsTeamMemberClicked(true)}>
            Team
          </div>

          <div
            className={`flex items-center w-[252px] h-14 pl-6 tx-sm font-medium border-l-primary-900 ${
              isTeamMemberClicked ? 'text-gray-400   border' : 'bg-primary-50 text-primary-900  border-2'
            } cursor-pointer  rounded-tr-xl border-b-0`}
            onClick={() => setIsTeamMemberClicked(false)}>
            Gnosis Safe
          </div>
        </div>

        <TeamTable
          data={isTeamMemberClicked ? teammates : pendingTeammates}
          isTeamMember={isTeamMemberClicked}
          companyName={companyName}
          isDisableAvailable={isTeamMemberClicked ? isMemberDisableAvailable : true}
        />
      </div>
    </div>
  );
};

export default Team;
