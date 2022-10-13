import Avatar from '@components/atoms/Avatar/Avatar';
import BackButton from '@components/atoms/BackButton/BackButton';
import Input from '@components/atoms/FormControls/Input/Input';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import { NextPage } from 'next';
import Router from 'next/router';
import AuthContext from 'providers/auth.context';
import OnboardingContext from 'providers/onboarding.context';
import React, { useContext } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { createMember } from 'services/db/member';
import { createOrg } from 'services/db/organization';

import TrashIcon from '../../public/icons/trash.svg';
import { emailPattern } from '../../types/constants/validation-patterns';

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
  const { signUpWithEmail, user } = useContext(AuthContext);
  const { onPrevious, onCompleteStep, info } = useContext(OnboardingContext);
  // Get to use the react-hook-form and set default values
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitted }
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

  console.log('Values', userTypeRadio, userName, userCompany, userCompanyEmail, errors, isValid, isDirty, isSubmitted);

  // Add a contributor to the list
  const addContributor = () => append({ name: '', email: '' });

  const onSubmit: SubmitHandler<AccountForm> = async (data) => {
    console.log('Form Submitted', data, getValues());
    const values = getValues();

    const orgId = await createOrg({ name: values.company, email: values.companyEmail, founderId: user?.uid });
    const memberId = await createMember({
      name: values.name,
      email: values.companyEmail,
      orgId: orgId,
      type: info?.accountType || ''
    });

    if (values.contributors && values.contributors.length > 0) {
      values.contributors.map(async (contributor) => {
        await createMember({ name: contributor.name, email: contributor.email, orgId: orgId, type: 'employee' });
      });
    }
    onCompleteStep({ accountId: memberId });
  };

  // Recommended by React hook forms when using field array https://react-hook-form.com/api/usefieldarray
  React.useEffect(() => {
    remove(0);
  }, [remove]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your account</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae iaculis nulla. Etiam eget rhoncus orci, ac
        vestibulum justo.
      </p>
      <div className="w-full my-6 panel">
        <div className="flex flex-row items-center gap-3.5 pb-5 border-b border-neutral-200">
          <Avatar name={userName.value || 'Your name'} size="large" placeholder="initials" />
          <div>
            <h2 className="h6 text-neutral-900">{userName.value || 'Your name'}</h2>
            <p className="text-sm text-neutral-500">{userCompany.value || 'Company name'}</p>
            {/* <p className="text-sm text-neutral-600">
              0x123126386ajdkhf8123923123laj
            </p> */}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200 mb-5">
            <Controller
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
            />
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your name"
                  placeholder="Enter your name"
                  error={Boolean(errors.name)}
                  success={!errors.name && (userName.state.isTouched || userName.state.isDirty) && isSubmitted}
                  message={
                    errors.name
                      ? 'Please enter your name'
                      : (userName.state.isTouched || userName.state.isDirty) && isSubmitted
                      ? 'Name is okay'
                      : ''
                  }
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
                  error={Boolean(errors.company)}
                  success={!errors.company && (userCompany.state.isTouched || userCompany.state.isDirty) && isSubmitted}
                  message={
                    errors.company
                      ? 'Please enter your company name'
                      : (userCompany.state.isTouched || userCompany.state.isDirty) && isSubmitted
                      ? 'Company name is okay'
                      : ''
                  }
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
                  error={Boolean(errors.companyEmail)}
                  success={
                    !errors.companyEmail &&
                    (userCompanyEmail.state.isTouched || userCompanyEmail.state.isDirty) &&
                    isSubmitted
                  }
                  message={
                    errors.companyEmail
                      ? 'Please enter your company email'
                      : (userCompanyEmail.state.isTouched || userCompanyEmail.state.isDirty) && isSubmitted
                      ? 'Company email is okay'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </div>
          {fields.map((contributor, contributorIndex) => (
            <div key={`contributor-${contributor.id}`} className="flex flex-row md:items-center gap-5 mb-5">
              <div className="grid md:grid-cols-2 gap-5 grow w-full">
                <Controller
                  name={`contributors.${contributorIndex}.name`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      label="Contributor's name"
                      placeholder="Enter contributor's name"
                      error={Boolean(getContributorState(contributorIndex).name.state.error)}
                      success={
                        !getContributorState(contributorIndex).name.state.error &&
                        (getContributorState(contributorIndex).name.state.isTouched ||
                          getContributorState(contributorIndex).name.state.isDirty) &&
                        isSubmitted
                      }
                      message={
                        getContributorState(contributorIndex).name.state.error
                          ? "Please enter contributor's name"
                          : (getContributorState(contributorIndex).name.state.isTouched ||
                              getContributorState(contributorIndex).name.state.isDirty) &&
                            isSubmitted
                          ? "Contributor's name is okay"
                          : ''
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
                      label="Contributor's email"
                      placeholder="Enter contributor's email"
                      error={Boolean(getContributorState(contributorIndex).email.state.error)}
                      success={
                        !getContributorState(contributorIndex).email.state.error &&
                        (getContributorState(contributorIndex).email.state.isTouched ||
                          getContributorState(contributorIndex).email.state.isDirty) &&
                        isSubmitted
                      }
                      message={
                        getContributorState(contributorIndex).email.state.error
                          ? "Please enter contributor's email"
                          : (getContributorState(contributorIndex).email.state.isTouched ||
                              getContributorState(contributorIndex).email.state.isDirty) &&
                            isSubmitted
                          ? "Contributor's email is okay"
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
          {userTypeRadio.value === 'organization' ? (
            <button type="button" className="secondary mb-5" onClick={addContributor}>
              Add more contributors
            </button>
          ) : null}
          <div className="flex flex-row justify-between items-center">
            <BackButton label="Return" onClick={() => onPrevious()} />
            <button className="primary" type="submit">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetupPage;
