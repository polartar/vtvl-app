import BackButton from '@components/atoms/BackButton/BackButton';
import Input from '@components/atoms/FormControls/Input/Input';
import Select from '@components/atoms/FormControls/Select/Select';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

interface Owner {
  name: string;
  address: string;
}

type ConfirmationForm = {
  organizationName: string;
  owners?: Owner[];
};

const ConfirmationPage: NextPage = () => {
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
      organizationName: 'VTVL',
      owners: [
        {
          name: 'Danny',
          address: '0x0123ADFhchadf7i12#ADSfjadf'
        },
        {
          name: 'Ada',
          address: '0x32131ADFhchadf7i12#ADSfjadf'
        }
      ],
      authorizedUsers: 0
    }
  });

  // Controls for the dynamic contributors
  const { fields, append } = useFieldArray({
    control,
    name: 'owners'
  });

  // Watch for these fields -- will later on be used to determine the checked state of the radio and other state checks
  const organizationName = { value: watch('organizationName'), state: getFieldState('organizationName') };
  const authorizedUsers = { value: watch('authorizedUsers'), state: getFieldState('authorizedUsers') };

  // For the dynamic owners list to get their individual states
  const getOwnersState = (index: number) => {
    return {
      name: {
        value: watch(`owners.${index}.name`),
        state: getFieldState(`owners.${index}.name`)
      },
      address: {
        value: watch(`owners.${index}.address`),
        state: getFieldState(`owners.${index}.address`)
      }
    };
  };

  const currentOwnerCount = +getValues('owners').length + 1;
  const [options, setOptions] = useState(currentOwnerCount || 0);

  console.log('Values', errors, isValid, isDirty, isSubmitted);

  // Add a contributor to the list
  const addOwner = () => {
    setOptions((prev) => prev + 1);
    append({ name: '', address: '' });
  };

  const onSubmit: SubmitHandler<ConfirmationForm> = (data) => {
    console.log('Form Submitted', data, getValues());
    Router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your safe</h1>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">
          You can natively create new, import or login to your existing gnisis safe multisig.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200 mb-5">
            <Controller
              name="organizationName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your organization name"
                  placeholder="Enter your organization name"
                  className="md:col-span-2"
                  error={Boolean(errors.organizationName)}
                  success={
                    !errors.organizationName &&
                    (organizationName.state.isTouched || organizationName.state.isDirty) &&
                    isSubmitted
                  }
                  message={
                    errors.organizationName
                      ? 'Please enter your organization name'
                      : (organizationName.state.isTouched || organizationName.state.isDirty) && isSubmitted
                      ? 'Organization name is okay'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </div>
          {fields.map((owner, ownerIndex) => (
            <div key={`owner-${owner.id}`} className="grid md:grid-cols-2 gap-5 mb-5">
              <Controller
                name={`owners.${ownerIndex}.name`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Owner's name"
                    placeholder="Enter owner's name"
                    error={Boolean(getOwnersState(ownerIndex).name.state.error)}
                    success={
                      !getOwnersState(ownerIndex).name.state.error &&
                      (getOwnersState(ownerIndex).name.state.isTouched ||
                        getOwnersState(ownerIndex).name.state.isDirty) &&
                      isSubmitted
                    }
                    message={
                      getOwnersState(ownerIndex).name.state.error
                        ? "Please enter owner's name"
                        : (getOwnersState(ownerIndex).name.state.isTouched ||
                            getOwnersState(ownerIndex).name.state.isDirty) &&
                          isSubmitted
                        ? "Owner's name is okay"
                        : ''
                    }
                    {...field}
                  />
                )}
              />
              <Controller
                name={`owners.${ownerIndex}.address`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Owner's address"
                    placeholder="Enter owner's address"
                    error={Boolean(getOwnersState(ownerIndex).address.state.error)}
                    success={
                      !getOwnersState(ownerIndex).address.state.error &&
                      (getOwnersState(ownerIndex).address.state.isTouched ||
                        getOwnersState(ownerIndex).address.state.isDirty) &&
                      isSubmitted
                    }
                    message={
                      getOwnersState(ownerIndex).address.state.error
                        ? "Please enter owner's address"
                        : (getOwnersState(ownerIndex).address.state.isTouched ||
                            getOwnersState(ownerIndex).address.state.isDirty) &&
                          isSubmitted
                        ? "Owner's address is okay"
                        : ''
                    }
                    {...field}
                  />
                )}
              />
            </div>
          ))}
          <button type="button" className="secondary mb-5" onClick={addOwner}>
            Add more owners
          </button>
          {options > 0 ? (
            <div className="border-t border-b border-neutral-300 py-5 mb-5 ">
              <Controller
                name="authorizedUsers"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label="How many people should authorize this transaction"
                    placeholder="Select how many"
                    className="md:col-span-2"
                    options={Array.from(Array(options).keys()).map((num) => {
                      return { label: num, value: num };
                    })}
                    required
                    error={Boolean(errors.authorizedUsers)}
                    success={
                      !errors.authorizedUsers &&
                      (authorizedUsers.state.isTouched || authorizedUsers.state.isDirty) &&
                      isSubmitted
                    }
                    message={
                      errors.authorizedUsers
                        ? 'Please select how many'
                        : (authorizedUsers.state.isTouched || authorizedUsers.state.isDirty) && isSubmitted
                        ? 'Authorized people'
                        : ''
                    }
                    {...field}
                  />
                )}
              />
            </div>
          ) : null}
          <div className="flex flex-row justify-between items-center">
            <BackButton label="Return" href="/onboarding/setup-safes" />
            <button className="primary flex flex-row items-center gap-2 group" type="submit">
              Sign and Authorize
              <img
                src="/icons/arrow-small-right-white.svg"
                alt="Proceed"
                className="transition-all w-6 h-6 group-hover:translate-x-1 fill-current text-white"
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationPage;
