import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '@providers/auth.context';
import { useTeammateContext } from '@providers/teammate.context';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addInvitee } from 'services/db/member';
import { fetchOrg } from 'services/db/organization';
import { IInvitee, IMember } from 'types/models';
import { ITeamRole } from 'types/models/settings';
import { convertLabelToOption } from 'utils/shared';
import * as Yup from 'yup';

import TeamTable from './TeamTable';

const defaultTeammanagement = {
  members: [
    {
      name: '',
      email: '',
      type: ITeamRole.Manager
    }
  ]
};

const defaultMember = {
  name: '',
  email: '',
  type: ITeamRole.Manager
};

export const VALID_EMAIL_REG =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Team = () => {
  const { user, sendTeammateInvite } = useAuthContext();
  const [isTeamMemberClicked, setIsTeamMemberClicked] = useState(true);
  const { teammates, pendingTeammates } = useTeammateContext();

  const [companyName, setCompanyName] = useState('');
  const [isInviting, setIsInviting] = useState(false);

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

  const addMoreMember = () => append(defaultMember);
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  const validationSchema = Yup.object()
    .strict(false)
    .shape({
      members: Yup.array(
        Yup.object().shape({
          name: Yup.string()
            .required('Team member name is required')
            .min(2, 'Team member name must contain at least two characters')
            .max(100, 'Team member name must contain less than 100 characters'),
          email: Yup.string()
            .required('Email is required')
            .max(100, 'Email must contain less than 100 characters')
            .matches(VALID_EMAIL_REG, 'Enter a valid email')
        })
      )
    });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues: defaultTeammanagement, resolver: yupResolver(validationSchema) });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `members`
  });

  const isMemberDisableAvailable = useMemo(() => {
    return teammates.filter((member: IMember) => member.type === ITeamRole.Founder).length > 1;
  }, [teammates]);

  const isMemberExist = (email: string) => {
    const existingMember = teammates.find((member) => member.email === email);
    if (existingMember) {
      toast.error('This member already exists');
      return true;
    }

    const pendingMember = pendingTeammates.find((member) => member.email === email);
    if (pendingMember) {
      toast.error('This member is already invited');
      return true;
    }
    return false;
  };

  const inviteMember = async (data: any) => {
    if (isInviting) return;
    if (user?.memberInfo?.org_id) {
      try {
        for (let i = 0; i < data.members.length; i++) {
          const member = data.members[i];
          if (isMemberExist(member.email)) {
            return;
          }
          const invitee: IInvitee = {
            org_id: user?.memberInfo?.org_id,
            name: member.name,
            email: member.email,
            type: member.type
          };
          setIsInviting(true);

          await sendTeammateInvite(member.email, member.type, member.name, companyName, user.memberInfo?.org_id);
          await addInvitee(invitee);
        }
        toast.success('Invited email successfully');
        reset();
      } catch (err: any) {
        toast.error('Something went wrong. ' + err.message);
      } finally {
        setIsInviting(false);
      }
    }
  };

  return (
    <div className="w-full grid grid-cols-12 gap-3">
      <div className="lg:col-span-3 ml-6 col-span-12">
        <div>
          <h1 className="h2 font-normal ">Members</h1>
          <p className=" text-gray-500 text-sm">Invite team members to your organization</p>
        </div>
      </div>

      <div className="lg:col-span-9 col-span-12 ml-2 lg:pr-6 pr-0">
        <form
          className="flex-row  gap-5 border-b border-t py-5 border-neutral-300 my-5"
          onSubmit={handleSubmit(inviteMember)}>
          {fields.map((item, index) => {
            return (
              <section className="md:grid-cols-3   sm:flex gap-2 mb-3" key={item.id}>
                <Controller
                  name={`members.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Name"
                      placeholder="Enter name"
                      required
                      error={Boolean(errors && errors['members'] && errors[`members`][index]?.name)}
                      message={
                        errors &&
                        errors['members'] &&
                        errors[`members`][index]?.name &&
                        errors[`members`][index]?.name?.message
                      }
                      {...field}
                    />
                  )}
                />

                <Controller
                  name={`members.${index}.email`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Email"
                      placeholder="Enter email"
                      required
                      error={Boolean(errors && errors['members'] && errors[`members`][index]?.email)}
                      message={
                        errors &&
                        errors['members'] &&
                        errors[`members`][index]?.email &&
                        errors[`members`][index]?.email?.message
                      }
                      {...field}
                    />
                  )}
                />
                <div className="flex w-full">
                  <Controller
                    name={`members.${index}.type`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <label className="required ">
                        <span>Role</span>
                        <SelectInput defaultValue={item.type} options={roles} {...field} />
                      </label>
                    )}
                  />
                  <div className="w-32  flex items-center justify-center pt-[20px] ">
                    <img
                      src="/icons/trash.svg"
                      alt={`Remove `}
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => (fields.length > 1 ? remove(index) : '')}
                    />
                  </div>
                </div>
              </section>
            );
          })}

          <div className="md:col-span-3 flex justify-between mt-2">
            <div className="py-1 text-secondary-900 cursor-pointer" onClick={handleSubmit(addMoreMember)}>
              {' '}
              + Add more members
            </div>
            <button type="submit" className="secondary py-1">
              {isInviting ? 'Inviting ... ' : '+ Send invite'}
            </button>
          </div>
        </form>

        <div className=" flex items-center font-medium  ">
          <div
            className={`flex items-center justify-between w-[252px] h-14 px-6 tx-sm font-medium border-primary-200 border-r-primary-900 ${
              isTeamMemberClicked ? ' bg-primary-50 text-primary-900  border-2' : 'text-gray-400   border'
            } cursor-pointer rounded-tl-xl border-b-0`}
            onClick={() => setIsTeamMemberClicked(true)}>
            <span>Team members</span>
            {teammates.length > 0 && (
              <div
                className={`avatar ${
                  isTeamMemberClicked ? 'bg-primary-900 text-white' : 'bg-primary-50 text-primary-500'
                } w-6 h-6`}>
                {teammates.length}
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-between w-[252px] h-14 px-6 tx-sm font-medium border-l-primary-900 ${
              isTeamMemberClicked ? 'text-gray-400   border' : 'bg-primary-50 text-primary-900  border-2'
            } cursor-pointer  rounded-tr-xl border-b-0`}
            onClick={() => setIsTeamMemberClicked(false)}>
            <span>Pending members</span>
            {pendingTeammates.length > 0 && (
              <div
                className={`avatar ${
                  !isTeamMemberClicked ? 'bg-primary-900 text-white' : 'bg-primary-50 text-primary-500'
                } w-6 h-6`}>
                {pendingTeammates.length}
              </div>
            )}
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
