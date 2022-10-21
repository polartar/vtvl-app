import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import Select from '@components/atoms/FormControls/Select/Select';
import Safe from '@gnosis.pm/safe-core-sdk';
import AuthContext from '@providers/auth.context';
import OnboardingContext from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import TrashIcon from 'public/icons/trash.svg';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { createSafe } from 'services/db/safe';
import { deploySafe, getSafeInfo } from 'services/gnosois';

interface Owner {
  name: string;
  address: string;
}

type ConfirmationForm = {
  organizationName: string;
  owners?: Owner[];
};

const NewSafePage: NextPage = () => {
  const { active, library, chainId } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { onNext, onPrevious } = useContext(OnboardingContext);
  const { query } = useRouter();
  const [isImported, setIsImported] = useState(false);
  const [importedSafeAddress, setImportedSafeAddress] = useState('');
  const [importedSafe, setImportedSafe] = useState<Safe>();
  const [owners, setOwners] = useState<{ name: string; address: string }[]>([{ name: '', address: '' }]);
  const [threshold, setThreshold] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  // const { safeAddress } = router.params
  console.log('routed query here pls ', query.safeAddress);

  useEffect(() => {
    if (query.safeAddress) {
      setImportedSafeAddress(query.safeAddress?.toString());
      (async () => {
        await getSafeDetails(importedSafeAddress);
      })();
    }
  }, []);

  const getSafeDetails = async (safeAddress: string) => {
    if (!active || !chainId || !library) {
      console.log('Please login with metamask to create safe');
      return;
    }
    console.log('getting safe details ');
    if (!user) {
      console.log('Please login to import safe');
      return;
    }
    try {
      const safe = await getSafeInfo(library, safeAddress);
      if (!safe) {
        console.log(
          "Unable to get info for this safe address, please make sure it's a valid safe address or try again"
        );
        return;
      }
      console.log('we have gotten safe dtails her ', safe);
      setImportedSafe(safe);
      const o = (await safe.getOwners()).map((o) => {
        return { name: '', address: o };
      });
      setOwners(o);
      const t = await safe.getThreshold();
      setThreshold(t);
      setIsImported(true);
    } catch (error: any) {
      console.log('error importing safe ', error);
    }
  };
  // Get to use the react-hook-form and set default values
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: {
      organizationName: '',
      owners: owners,
      authorizedUsers: threshold
    }
  });

  // Controls for the dynamic contributors
  const { fields, append, remove } = useFieldArray({
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

  const onSubmit: SubmitHandler<ConfirmationForm> = async (data) => {
    console.log('Form Submitted', data, getValues());
    setFormSuccess(false);
    setFormError(false);
    setFormMessage('');

    try {
      const values = getValues();
      const owners = values.owners.map((o) => o.address);
      if (!active) {
        setFormMessage('Please login with metamask to create safe');
        setFormError(true);
        return;
      }
      if (!user) {
        setFormMessage('Please sign up to deploy a safe');
        setFormError(true);
        return;
      }

      const safe = isImported ? importedSafe : await deploySafe(library, owners, values.authorizedUsers);

      if (!safe) {
        console.log('invalid safe configurations ');
        setFormMessage('Invalid safe configurations');
        setFormError(true);
        return;
      }
      const storedSafeId = await createSafe({
        user_id: user?.uid,
        address: safe.getAddress(),
        chainId: chainId || 0,
        owners: values.owners,
        threshold: values.authorizedUsers
      });
      return await onNext({ safeId: storedSafeId });
    } catch (error) {
      console.log('error getting safe info ', error);
      setFormMessage('Error getting safe info');
      setFormError(true);
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your multi-sig safe</h1>
      <Form
        className="w-full my-6"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        error={formError}
        success={formSuccess}
        message={formMessage}>
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">
          You can natively create new, import or login to your existing gnisis safe multisig.
        </p>
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
                required
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
          <div key={`owner-${owner.id}`} className="flex flex-row md:items-center gap-5 mb-5">
            <div className="grid md:grid-cols-2 gap-5 grow w-full">
              <Controller
                name={`owners.${ownerIndex}.name`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Owner's name"
                    placeholder="Enter owner's name"
                    required
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
                    required
                    disabled={isImported && field.value ? true : false}
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
            <TrashIcon
              className="stroke-current text-neutral-700 w-5 h-5 cursor-pointer transition-all transform-gpu hover:-translate-y-0.5"
              onClick={() => remove(ownerIndex)}
            />
          </div>
        ))}
        <button type="button" className="secondary mb-5 flex flex-row items-center gap-2 py-1.5" onClick={addOwner}>
          <img src="/icons/plus.svg" alt="Add more members" aria-hidden="true" />
          Add more
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
                  disabled={isImported && field.value ? true : false}
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
          <BackButton label="Return" onClick={() => onPrevious()} />
          <Button className="primary group" type="submit" loading={isSubmitting}>
            <span className="flex flex-row items-center gap-2 ">
              Sign and Authorize
              <img
                aria-hidden="true"
                src="/icons/arrow-small-right-white.svg"
                alt="Proceed"
                className="transition-all w-6 h-6 group-hover:translate-x-1 fill-current text-white"
              />
            </span>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewSafePage;
