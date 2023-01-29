import CreateLabel from '@components/atoms/CreateLabel/CreateLabel';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select/dist/declarations/src/Select';
import { ITeamManagement, ITeamRole } from 'types/models/settings';
import { convertLabelToOption } from 'utils/shared';

import TeamTable from './TeamTable';

const defaultRecipientValues: ITeamManagement = {
  name: '',
  company: '',
  role: ITeamRole.Founder
};

const Team = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ defaultValues: defaultRecipientValues });
  const [isTeamMember, setIsTeamMember] = useState(true);
  const inviteMember = (data: ITeamManagement) => console.log(data);
  const addMember = (data: ITeamManagement) => console.log(data);
  const roles = Object.keys(ITeamRole).map((role) => convertLabelToOption(role));

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
            render={({ field }) => (
              <Input
                label="Name"
                placeholder="Enter name (optional)"
                error={Boolean(errors.name)}
                message={errors.name ? 'Please enter name' : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="company"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Company name"
                placeholder="Enter company name"
                required
                error={Boolean(errors.company)}
                message={errors.company ? 'Please enter your company name' : ''}
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
                <span>Recipient type</span>
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
            className={`flex items-center w-[252px] h-14 pl-6 tx-sm font-medium  ${
              isTeamMember ? 'text-primary-900 border-primary-900 border-2' : 'text-gray-400 border-primary-200 border'
            } cursor-pointer rounded-tl-xl border-b-0`}
            onClick={() => setIsTeamMember(true)}>
            Team
          </div>

          <div
            className={`flex items-center w-[252px] h-14 pl-6 tx-sm font-medium ${
              isTeamMember ? 'text-gray-400 border-primary-200 border' : 'text-primary-900 border-primary-900 border-2'
            } cursor-pointer  rounded-tr-xl border-b-0`}
            onClick={() => setIsTeamMember(false)}>
            Gnosis Safe
          </div>
        </div>

        <TeamTable />
      </div>
    </div>
  );
};

export default Team;
