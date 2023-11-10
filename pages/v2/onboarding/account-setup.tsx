import useAuthAPI from '@api-hooks/useAuth';
import useOrgAPI from '@api-hooks/useOrganization';
import useUserAPI from '@api-hooks/useUser';
import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import useAuth from '@hooks/useAuth';
import useSafePush from '@hooks/useSafePush';
import { useGlobalContext } from '@providers/global.context';
import { useAuth as useAuthStore } from '@store/useAuth';
import { useOrganization } from '@store/useOrganizations';
import { REDIRECT_URIS, WEBSITE_NAME } from '@utils/constants';
import { NextPage } from 'next';
import PlusIcon from 'public/icons/plus.svg';
import TrashIcon from 'public/icons/trash.svg';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { emailPattern } from 'types/constants/validation-patterns';
import { IRole } from 'types/models/settings';

interface Contributor {
  name: string;
  email: string;
}

type AccountForm = {
  name: string;
  type: string;
  company: string;
  companyEmail: string;
  contributors?: Contributor[];
};

const AccountSetupPage: NextPage = () => {
  const { userId } = useAuthStore();
  const { authorizeUser } = useAuth();
  const { organizations } = useOrganization();
  const { logout } = useAuthAPI();
  const { updateUserProfile } = useUserAPI();
  const { createOrganization, inviteMember } = useOrgAPI();
  const { safePush } = useSafePush();

  const {
    website: { name }
  } = useGlobalContext();
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Get to use the react-hook-form and set default values
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitting, isSubmitted }
  } = useForm({
    defaultValues: {
      name: '',
      company: '',
      companyEmail: '',
      type: 'organization',
      contributors: [
        {
          name: '',
          email: ''
        }
      ]
    }
  });

  // Controls for the dynamic contributors
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contributors'
  });

  // Watch for these fields -- will later on be used to determine the checked state of the radio and other state checks
  const userTypeRadio = { value: watch('type'), state: getFieldState('type') };
  const userName = { value: watch('name'), state: getFieldState('name') };
  const userCompany = {
    value: watch('company'),
    state: getFieldState('company')
  };
  const userCompanyEmail = {
    value: watch('companyEmail'),
    state: getFieldState('companyEmail')
  };

  // For the dynamic contributors list to get their individual states
  const getContributorState = (index: number) => {
    return {
      name: {
        value: watch(`contributors.${index}.name`),
        state: getFieldState(`contributors.${index}.name`)
      },
      email: {
        value: watch(`contributors.${index}.email`),
        state: getFieldState(`contributors.${index}.email`)
      }
    };
  };

  // Add a contributor to the list
  const addContributor = () => append({ name: '', email: '' });

  const handleSaveContributors = useCallback(
    async (contributors: Contributor[], organizationId?: string) => {
      if (contributors && contributors.length && ((organizations && organizations.length) || organizationId)) {
        contributors.map(async (contributor) => {
          await inviteMember({
            organizationId: organizationId || organizations[0].id,
            name: contributor.name,
            email: contributor.email,
            role: IRole.MANAGER,
            redirectUri: REDIRECT_URIS.INVITE_MEMBER
          });
        });
      }
    },
    [organizations]
  );

  // Should always return a promise to resolve in order to make the isSubmitting work
  const onSubmit: SubmitHandler<AccountForm> = async (data) => {
    const values = getValues();
    setFormSuccess(false);
    setFormError(false);
    setFormMessage('');

    try {
      // Update the user profile name
      const userProfile = await updateUserProfile({ name: data.name });
      // Create an organization under the user
      const newOrganization = await createOrganization({
        name: data.company,
        email: data.companyEmail
      });

      console.log('Create organization', userId, organizations, data);

      // Add the same user as a member
      /**
       * @dev NO need to create new member here.
       * The organization creator will be the member of that organization as a founder.
       */
      // const addMember = await createMember({
      //   organizationId: organizations[0].id,
      //   members: [userId]
      // });

      // console.log('Create organization', orgId, addMember);

      // Add every other users as member for invitation
      if (data.contributors && data.contributors.length) {
        await handleSaveContributors(values.contributors, newOrganization ? newOrganization.id : undefined);
      }
      setFormSuccess(true);
      // Update later with reusable onboarding steps
      if (newOrganization) {
        // Save the user data when possible
        // saveUser({ organizationId: newOrganization.id, role: IRole.FOUNDER });
        await authorizeUser(false);
        safePush('/v2/onboarding/setup-safes');
      }
    } catch (error) {
      console.error(error);
      setFormError(true);
      setFormMessage((error as any).message);
    }
  };

  // Recommended by React hook forms when using field array https://react-hook-form.com/api/usefieldarray
  React.useEffect(() => {
    remove(0);
  }, [remove]);

  const handleCancel = async () => {
    await logout();
    safePush('/');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
      <Typography size="title" variant="sora" className="font-medium text-neutral-900">
        Hey there, Welcome to {name || WEBSITE_NAME}
      </Typography>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Let's get to know you so you can start setting up your account.
      </p>
      <Form
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full my-6"
        error={formError}
        success={formSuccess}
        message={formMessage}>
        <div className="flex flex-row items-center gap-3.5 pb-5 border-b border-neutral-200">
          {/* TEMPORARILY HIDE the avatar as it does not have a function yet */}
          {/* <Avatar name={userName.value || 'Your name'} size="large" placeholder="initials" /> */}
          <div>
            <h2 className="h4 font-bold text-neutral-900">{userName.value || 'Your name'}</h2>
            <p className="text-sm text-neutral-500">{userCompany.value || 'Company name'}</p>
            {/* <p className="text-sm text-neutral-600">
              0x123126386ajdkhf8123923123laj
            </p> */}
          </div>
        </div>
        <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200 mb-5">
          {/* REMOVE USER TYPE - Organization / Individual */}
          {/* <Controller
            name="type"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Radio
                label="Organization"
                variant="input-style"
                checked={userTypeRadio.value === 'organization'}
                {...field}
                value="organization"
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Radio
                label="Individual"
                variant="input-style"
                {...field}
                checked={userTypeRadio.value === 'individual'}
                value="individual"
              />
            )}
          /> */}
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Your name"
                placeholder="Enter your name"
                required
                error={Boolean(errors.name)}
                message={errors.name ? 'Please enter your name' : ''}
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
                placeholder="Enter your company name"
                required
                error={Boolean(errors.company)}
                message={errors.company ? 'Please enter your company name' : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="companyEmail"
            control={control}
            rules={{ required: true, pattern: emailPattern }}
            render={({ field }) => (
              <Input
                label="Your company email"
                placeholder="Enter your company email address"
                className="md:col-span-2"
                required
                error={Boolean(errors.companyEmail)}
                message={errors.companyEmail ? 'Please enter your company email' : ''}
                {...field}
              />
            )}
          />
        </div>
        {userTypeRadio.value === 'organization' ? (
          <>
            <label className="mb-3">
              <span>Invite team members to your organization</span>
            </label>
            {fields.map((contributor, contributorIndex) => (
              <div key={`contributor-${contributor.id}`} className="flex flex-row md:items-center gap-5 mb-5">
                <div className="grid md:grid-cols-2 gap-5 grow w-full">
                  <Controller
                    name={`contributors.${contributorIndex}.name`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        label="Team member name"
                        placeholder="Enter team member name"
                        required
                        error={Boolean(getContributorState(contributorIndex).name.state.error)}
                        message={
                          getContributorState(contributorIndex).name.state.error ? 'Please enter team member name' : ''
                        }
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name={`contributors.${contributorIndex}.email`}
                    control={control}
                    rules={{ required: true, pattern: emailPattern }}
                    render={({ field }) => (
                      <Input
                        label="Team member email"
                        placeholder="Enter team member email"
                        required
                        error={Boolean(getContributorState(contributorIndex).email.state.error)}
                        message={
                          getContributorState(contributorIndex).email.state.error
                            ? 'Please enter team member email'
                            : ''
                        }
                        {...field}
                      />
                    )}
                  />
                </div>
                <TrashIcon
                  className="flex stroke-current w-5 h-5 text-neutral-700 grow-0 shrink-0 cursor-pointer transition-all transform-gpu hover:-translate-y-0.5"
                  onClick={() => remove(contributorIndex)}
                />
              </div>
            ))}

            <button
              type="button"
              className="secondary mb-5 flex flex-row items-center gap-2 py-1.5"
              onClick={addContributor}>
              <PlusIcon alt="Invite" aria-hidden="true" />
              Invite
            </button>
          </>
        ) : null}
        <div className="flex flex-row justify-between items-center">
          <BackButton label="Cancel" onClick={handleCancel} />
          <Button className="primary" type="submit" loading={isSubmitting}>
            Continue
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AccountSetupPage;
