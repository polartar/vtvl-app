import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import Hint from '@components/atoms/Hint/Hint';
import { Typography } from '@components/atoms/Typography/Typography';
import MetamaskUnsupportedChainModal from '@components/organisms/MetamaskUnsupportedChainModal';
import UnsupportedChainModal from '@components/organisms/UnsupportedChainModal';
import Safe from '@gnosis.pm/safe-core-sdk';
import AuthContext, { useAuthContext } from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTransactionLoaderContext } from 'providers/transaction-loader.context';
import PlusIcon from 'public/icons/plus.svg';
import TrashIcon from 'public/icons/trash.svg';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { createOrUpdateSafe, fetchSafeByAddress } from 'services/db/safe';
import { deploySafe, getSafeInfo } from 'services/gnosois';
import { SafeSupportedChains } from 'types/constants/supported-chains';
import { VALIDATION_ERROR_MESSAGES, emailRegex } from 'utils/validator';

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
  const { active, library, chainId, error } = useWeb3React();
  const { fetchSafe } = useAuthContext();
  const { user } = useContext(AuthContext);
  const { onNext, onPrevious, inProgress, startOnboarding } = useContext(OnboardingContext);
  const { transactionStatus, setTransactionStatus } = useTransactionLoaderContext();
  const { query, push: routerPush } = useRouter();
  const { ModalWrapper: ModalWrapper1, showModal: showModal1, hideModal: hideModal1 } = useModal({});
  const { ModalWrapper: ModalWrapper2, showModal: showModal2, hideModal: hideModal2 } = useModal({});

  const [importedSafe, setImportedSafe] = useState<Safe>();
  const [owners, setOwners] = useState<{ name: string; address: string; email: string }[]>([
    { name: '', address: '', email: '' }
  ]);
  const [threshold, setThreshold] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [safeRef, setSafeRef] = useState<string>();

  const returnUrl = (query?.returnUrl ?? '') as string;

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

      setImportedSafe(safe);
      const o = (await safe.getOwners()).map((o) => {
        return { name: '', address: o, email: '' };
      });
      setOwners(o);
      const t = await safe.getThreshold();
      setThreshold(t);
    } catch (error) {
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
    setValue,
    reset,
    setError,
    formState: { errors, isValid, isDirty, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: {
      organizationName: '',
      owners: [{ name: '', address: '', email: '' }],
      authorizedUsers: 1
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
  const [options, setOptions] = useState(getValues('owners').length);

  console.log('Values', errors, isValid, isDirty, isSubmitted);

  // Add a contributor to the list
  const addOwner = () => {
    append({ name: '', address: '', email: '' });
    setOptions(getValues('owners').length);
    // Ensures that at least 1 signee is authorized after adding an owner and if the authorized users is set to 0.
    if (!authorizedUsers.value) setValue('authorizedUsers', 1);
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
      const authThreshold = await safe.getThreshold();
      defaultValues.owners = o;
      // Use the correct value for authorized users by checking on the threshold.
      defaultValues.authorizedUsers = o.length > authThreshold ? authThreshold : o.length;
      //populate with existing safe if we have it stored
      const savedSafe = await fetchSafeByAddress(safe.getAddress());
      if (savedSafe) {
        defaultValues.owners = savedSafe.owners;
        defaultValues.organizationName = savedSafe.org_name;
        setSafeRef(savedSafe?.id);
      }
      // Set the options depending on the number of owners
      // setOptions(defaultValues.authorizedUsers);
      setOptions(o.length);
      reset({ ...defaultValues });
    } catch (error) {
      console.log('error importing safe ', error);
      setFormError(true);
      setFormMessage(
        "Unable to get info for this safe address, please make sure it's a valid safe address or try again"
      );
    }
  };

  // Validates for duplicate wallet address and emails
  const validateOwners = () => {
    const owners = getValues('owners');
    let validity = true;
    // Loop through all the owners and check if the current owner has a duplicate wallet address or email
    owners.map((ownerDetails, index) => {
      owners.map((owner, ownerIndex) => {
        // Validate only on possible duplicates
        if (ownerIndex !== index) {
          // Marks this current owner for error if it has the same wallet address
          if (ownerDetails.address === owner.address) {
            setError(`owners.${index}.address`, {
              type: 'duplicateWallet',
              message: 'Duplicate wallet address'
            });
            setError(`owners.${ownerIndex}.address`, {
              type: 'duplicateWallet',
              message: 'Duplicate wallet address'
            });
            validity = false;
          }
          // Marks this current owner for error if it has the same email address
          if (ownerDetails.email === owner.email) {
            setError(`owners.${index}.email`, { type: 'duplicateEmail', message: 'Duplicate email' });
            setError(`owners.${ownerIndex}.email`, { type: 'duplicateEmail', message: 'Duplicate email' });
            validity = false;
          }
        }
      });
    });
    return validity;
  };

  const onSubmit: SubmitHandler<ConfirmationForm> = async (data) => {
    console.log('Form Submitted', data, getValues());
    setFormSuccess(false);
    setFormError(false);
    setFormMessage('');

    try {
      if (error instanceof UnsupportedChainIdError) {
        showModal2();
        return;
      }
      if (!chainId || !SafeSupportedChains.find((c) => c === chainId)) {
        showModal1();
        return;
      }

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

      // Check for duplicates in the safe owners.
      if (!validateOwners()) {
        return;
      }

      if (!importedSafe) {
        setTransactionStatus('PENDING');
      }
      console.log({ values });
      const safe = importedSafe ? importedSafe : await deploySafe(library, owners, values.authorizedUsers);

      if (!importedSafe) {
        setTransactionStatus('IN_PROGRESS');
      }

      if (!safe) {
        console.log('invalid safe configurations ');
        setFormMessage(
          importedSafe ? 'Error importing safe. Please try again.' : 'Error creating safe. Please try again.'
        );
        if (!importedSafe) {
          setTransactionStatus('ERROR');
        }
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
      fetchSafe();
      if (!importedSafe) {
        setTransactionStatus('SUCCESS');
      }
      return await onNext({ safeAddress: safe.getAddress() });
    } catch (error) {
      console.error('error getting safe info ', error);
      // setFormMessage(`Multisig error: ${(error as any)?.message}`);
      if (((error as any)?.message as string).includes('user rejected transaction')) {
        setFormMessage(`Multisig error: User rejected transaction.`);
      } else if (((error as any)?.message as string).includes('invalid address')) {
        setFormMessage(`Multisig error: Invalid arguments.`);
      } else {
        setFormMessage(`Multisig error: Something went wrong. Try again.`);
      }
      setFormError(true);
      if (!importedSafe) {
        setTransactionStatus('ERROR');
      }
      return;
    }
  };

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) {
      showModal2();
      hideModal1();
      return;
    }
    hideModal2();
    if (!chainId || !SafeSupportedChains.find((c) => c === chainId)) {
      showModal1();
    } else {
      hideModal1();
    }
  }, [chainId, error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
      <div className="text-center">
        <Typography
          size="title"
          variant="sora"
          className="font-medium text-neutral-900 mb-1 flex flex-row items-center gap-1">
          Setup your multi-sig{' '}
          <Hint
            tip={
              <>
                <i>Safe</i> is a multi-signature smart contract wallet that allows users to define a list of
                owner/signer accounts and a threshold number of signers required to confirm a transaction.
              </>
            }>
            <img src="/images/safe.png" className="w-28" alt="Safe" />
          </Hint>
        </Typography>
        <p className="text-xs font-medium">
          Need help with what exactly is Safe?{' '}
          <a
            className="text-primary-900"
            href="https://help.safe.global/en/articles/40869-what-is-safe"
            target="_blank">
            Give me more info
          </a>
        </p>
      </div>
      <Form
        className="w-full my-6"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        error={formError}
        success={formSuccess}
        message={formMessage}>
        <h2 className="h5 font-semibold text-neutral-900">Your Safes</h2>
        <p className="text-sm text-neutral-500">Create a new Safe or import an existing Safe</p>
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
                    label="Owner wallet address"
                    placeholder="Enter owner wallet address"
                    required
                    disabled={importedSafe ? true : false}
                    error={Boolean(getOwnersState(ownerIndex).address.state.error)}
                    message={
                      getOwnersState(ownerIndex).address.state.error
                        ? getOwnersState(ownerIndex).address.state.error?.type === 'duplicateWallet'
                          ? getOwnersState(ownerIndex).address.state.error?.message
                          : 'Please enter owner wallet address'
                        : ''
                    }
                    className="md:col-span-2"
                    {...field}
                  />
                )}
              />
              <Controller
                name={`owners.${ownerIndex}.email`}
                control={control}
                rules={{ required: true, pattern: emailRegex }}
                render={({ field }) => (
                  <Input
                    label="Owner email"
                    placeholder="Enter owner email"
                    required
                    error={Boolean(getOwnersState(ownerIndex).email.state.error)}
                    message={
                      getOwnersState(ownerIndex)?.email?.state?.error?.type === 'duplicateEmail'
                        ? getOwnersState(ownerIndex).email.state.error?.message
                        : getOwnersState(ownerIndex).email.state.error?.type === 'pattern'
                        ? VALIDATION_ERROR_MESSAGES.EMAIL
                        : getOwnersState(ownerIndex).email.state.error?.type === 'required'
                        ? 'Please enter owner email'
                        : ''
                    }
                    className="md:col-span-3"
                    {...field}
                  />
                )}
              />
            </div>
            <TrashIcon
              className="stroke-current text-neutral-700 w-5 h-5 cursor-pointer transition-all transform-gpu hover:-translate-y-0.5"
              onClick={() => {
                remove(ownerIndex);
                setOptions(getValues('owners').length);
              }}
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
                <span className="paragraphy-small-medium text-neutral-800">out of {options} owner(s)</span>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex flex-row justify-between items-center">
          <BackButton
            label={returnUrl ? 'Back to settings' : 'Back to founder details'}
            onClick={() => (returnUrl ? routerPush(returnUrl) : onPrevious())}
          />
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
      <ModalWrapper1>
        <UnsupportedChainModal hideModal={hideModal1} />
      </ModalWrapper1>
      <ModalWrapper2>
        <MetamaskUnsupportedChainModal hideModal={hideModal2} />
      </ModalWrapper2>
    </div>
  );
};

export default NewSafePage;
