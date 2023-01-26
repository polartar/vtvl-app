import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '@providers/auth.context';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ITeamManagement, ITeamRole, ITeamTableData } from 'types/models/settings';
import { convertLabelToOption } from 'utils/shared';
import * as Yup from 'yup';

import TeamTable from './TeamTable';

const defaultRecipientValues: ITeamManagement = {
  name: '',
  email: '',
  role: ITeamRole.Founder
};

const mockTableData: ITeamTableData[] = [
  {
    name: 'Vie Dee',
    email: 'test@gmail.com',
    joinedAt: new Date('2022/01/1'),
    role: ITeamRole.Founder
  },
  {
    name: 'Vie Dee',
    email: 'test@gmail.com',
    joinedAt: new Date('2022/01/1'),
    role: ITeamRole.Manager
  }
];
const VALID_EMAIL_REG =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Team = () => {
  const { user } = useAuthContext();
  console.log({ user });
  const [isTeamMember, setIsTeamMember] = useState(true);
  const inviteMember = (data: ITeamManagement) => console.log(data);
  const addMember = (data: ITeamManagement) => console.log(data);
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));
  const validationSchema = Yup.object()
    .strict(false)
    .shape({
      name: Yup.string()
        .required('Name is required')
        .min(2, 'Must be at least 2 characters')
        .max(100, 'Cannot be more than 100 characters'),
      email: Yup.string()
        .required('Email is required')
        .min(2, 'Must be at least 2 characters')
        .max(100, 'Cannot be more than 100 characters')
        .matches(VALID_EMAIL_REG, 'Invalid Eamil')
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
            <div className="py-1 text-secondary-900 cursor-pointer" onClick={handleSubmit(addMember)}>
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
              isTeamMember ? ' bg-primary-50 text-primary-900  border-2' : 'text-gray-400   border'
            } cursor-pointer rounded-tl-xl border-b-0`}
            onClick={() => setIsTeamMember(true)}>
            Team
          </div>

          <div
            className={`flex items-center w-[252px] h-14 pl-6 tx-sm font-medium border-l-primary-900 ${
              isTeamMember ? 'text-gray-400   border' : 'bg-primary-50 text-primary-900  border-2'
            } cursor-pointer  rounded-tr-xl border-b-0`}
            onClick={() => setIsTeamMember(false)}>
            Gnosis Safe
          </div>
        </div>

        <TeamTable data={mockTableData} />
      </div>
    </div>
  );
};

export default Team;
