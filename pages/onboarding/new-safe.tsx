import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import Safe from '@gnosis.pm/safe-core-sdk';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import TrashIcon from 'public/icons/trash.svg';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { createOrUpdateSafe, fetchSafeByAddress } from 'services/db/safe';
import { deploySafe, getSafeInfo } from 'services/gnosois';

interface Owner {
  name: string;
  address: string;
  email: string;
}

type ConfirmationForm = {
  organizationName: string;
  owners?: Owner[];
};

const NewSafePage: NextPage = () => {
  const { active, library, chainId } = useWeb3React();
  const { user } = useContext(AuthContext);
  const { onNext, onPrevious, inProgress, startOnboarding } = useContext(OnboardingContext);
  const { query } = useRouter();
  const [importedSafe, setImportedSafe] = useState<Safe>();
  const [owners, setOwners] = useState<{ name: string; address: string; email: string }[]>([
    { name: '', address: '', email: '' }
  ]);
  const [threshold, setThreshold] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [safeRef, setSafeRef] = useState<string>();

  useEffect(() => {
    console.log('we have imported safe here ', importedSafe);
    if (!inProgress) startOnboarding(Step.SafeSetup);
    if (query.address) {
      (async () => {
        await importSafe(query.address?.toString() || '');
      })();
    }
  }, [query.address]);

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
        return { name: '', address: o, email: '' };
      });
      setOwners(o);
      const t = await safe.getThreshold();
      setThreshold(t);
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
    reset,
    formState: { errors, isValid, isDirty, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: {
      organizationName: '',
      owners: [{ name: '', address: '', email: '' }],
      authorizedUsers: 0
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
      },
      email: {
        value: watch(`owners.${index}.email`),
        state: getFieldState(`owners.${index}.email`)
      }
    };
  };

  const currentOwnerCount = +getValues('owners').length + 1;
  const [options, setOptions] = useState(currentOwnerCount);

  console.log('Values', errors, isValid, isDirty, isSubmitted);

  // Add a contributor to the list
  const addOwner = () => {
    setOptions((prev) => prev + 1);
    append({ name: '', address: '', email: '' });
  };

  const importSafe = async (address: string) => {
    if (!active || !chainId || !library) {
      setFormError(true);
      setFormMessage('Please login with metamask to setup safe!');
      return;
    }

    if (!user) {
      setFormError(true);
      setFormMessage('Please login to setup safe!');
      return;
    }
    try {
      const safe = await getSafeInfo(library, address);
      if (!safe) {
        setFormError(true);
        setFormMessage(
          "Unable to get info for this safe address, please make sure it's a valid safe address or try again"
        );
        return;
      }

      const o = (await safe.getOwners()).map((o) => {
        return { name: '', address: o };
      });

      setImportedSafe(safe);
      const defaultValues: any = {};
      defaultValues.owners = o;
      defaultValues.authorizedUsers = await safe.getThreshold();
      //populate with existing safe if we have it stored
      const savedSafe = await fetchSafeByAddress(await safe.getAddress());
      if (savedSafe) {
        defaultValues.owners = savedSafe.owners;
        defaultValues.organizationName = savedSafe.org_name;
        setSafeRef(savedSafe?.id);
      }
      setOptions(defaultValues.authorizedUsers);
      reset({ ...defaultValues });
    } catch (error: any) {
      console.log('error importing safe ', error);
      setFormError(true);
      setFormMessage(
        "Unable to get info for this safe address, please make sure it's a valid safe address or try again"
      );
    }
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
        setFormMessage('Please login with metamask to setup safe');
        setFormError(true);
        return;
      }
      if (!user) {
        setFormMessage('Please sign up to deploy a safe');
        setFormError(true);
        return;
      }

      const safe = importedSafe !== null ? importedSafe : await deploySafe(library, owners, values.authorizedUsers);

      if (!safe) {
        console.log('invalid safe configurations ');
        setFormMessage(importedSafe !== null ? 'Could not import safe, invalid configurations.' : '');
        setFormError(true);
        return;
      }

      await createOrUpdateSafe(
        {
          user_id: user?.uid,
          org_id: user?.memberInfo?.org_id || '',
          org_name: values.organizationName,
          address: safe.getAddress(),
          chainId: chainId || 0,
          owners: values.owners,
          threshold: values.authorizedUsers
        },
        safeRef
      );
      return await onNext({ safeAddress: safe.getAddress() });
    } catch (error) {
      console.log('error getting safe info ', error);
      setFormMessage('Error getting safe info');
      setFormError(true);
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
      <h1 className="text-neutral-900">Setup your multi-sig safe</h1>
      <Form
        className="w-full my-6"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        error={formError}
        success={formSuccess}
        message={formMessage}>
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">Natively create a new Safe or login to your existing one</p>
        <div className="grid md:grid-cols-3 py-5 gap-5 border-b border-neutral-200 mb-5">
          <Controller
            name="organizationName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Your organisation name"
                placeholder="Enter your organisation name"
                className="md:col-span-3"
                error={Boolean(errors.organizationName)}
                required
                message={errors.organizationName ? 'Please enter your organisation name' : ''}
                {...field}
              />
            )}
          />
        </div>
        {fields.map((owner, ownerIndex) => (
          <div key={`owner-${owner.id}`} className="flex flex-row md:items-start gap-5 mb-5">
            <div className="grid md:grid-cols-3 gap-5 grow w-full">
              <Controller
                name={`owners.${ownerIndex}.name`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Owner name"
                    placeholder="Enter owner name"
                    required
                    error={Boolean(getOwnersState(ownerIndex).name.state.error)}
                    message={getOwnersState(ownerIndex).name.state.error ? 'Please enter owner name' : ''}
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
                    label="Owner address"
                    placeholder="Enter owner address"
                    required
                    disabled={importedSafe ? true : false}
                    error={Boolean(getOwnersState(ownerIndex).address.state.error)}
                    message={getOwnersState(ownerIndex).address.state.error ? 'Please enter owner address' : ''}
                    className="md:col-span-2"
                    {...field}
                  />
                )}
              />
              <Controller
                name={`owners.${ownerIndex}.email`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Owner email"
                    placeholder="Enter owner email"
                    required
                    error={Boolean(getOwnersState(ownerIndex).email.state.error)}
                    message={getOwnersState(ownerIndex).email.state.error ? 'Please enter owner email' : ''}
                    className="md:col-span-3"
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
          <PlusIcon alt="Add more members" aria-hidden="true" />
          Add more
        </button>
        {options > 0 ? (
          <div className="border-t border-b border-neutral-300 py-5 mb-5 ">
            <div className="md:col-span-2">
              <label className="required">
                <span>Any transaction requires the confirmation of:</span>
              </label>
              <div className="row-center">
                <Controller
                  name="authorizedUsers"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInput
                      placeholder="Select how many"
                      className="w-24"
                      options={Array.from(Array(options).keys()).map((num) => {
                        return { label: num + 1, value: num + 1 };
                      })}
                      required
                      disabled={importedSafe ? true : false}
                      error={Boolean(errors.authorizedUsers)}
                      message={errors.authorizedUsers ? 'Please select how many' : ''}
                      {...field}
                    />
                  )}
                />
                <span className="paragraphy-small-medium text-neutral-800">out of {options - 1} owner(s)</span>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex flex-row justify-between items-center">
          <BackButton label="Back to founder details" onClick={() => onPrevious()} />
          <Button className="primary group" type="submit" loading={isSubmitting}>
            <span className="flex flex-row items-center gap-2 ">
              Sign and authorize
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
