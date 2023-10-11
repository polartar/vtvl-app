import SafeApiService from '@api-services/SafeApiService';
import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import UnsupportedChainModal from '@components/organisms/UnsupportedChainModal';
import { useAuthContext } from '@providers/auth.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { useModal } from 'hooks/useModal';
import { useShallowState } from 'hooks/useShallowState';
import PlusIcon from 'public/icons/plus.svg';
import TrashIcon from 'public/icons/trash.svg';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { deploySafe } from 'services/gnosois';
import { SafeSupportedChains } from 'types/constants/supported-chains';
import { VALIDATION_ERROR_MESSAGES, emailRegex } from 'utils/validator';

interface Owner {
  name: string;
  address: string;
  email: string;
}

type ConfirmationForm = {
  safeName: string;
  owners?: Owner[];
};

export default function SafeForm({ onBack }: { onBack: () => void }) {
  const { active, library, chainId } = useWeb3React();
  const { user, organizationId } = useAuthContext();
  const { setTransactionStatus } = useTransactionLoaderContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      safeName: '',
      owners: [{ name: '', address: '', email: '' }],
      authorizedUsers: 1
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'owners'
  });

  const [state, setState] = useShallowState({
    formError: false,
    formSuccess: false,
    formMessage: ''
  });

  const [options, setOptions] = useState(getValues('owners').length);

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

  const onSubmit: SubmitHandler<ConfirmationForm> = async (data) => {
    setState({
      formError: false,
      formSuccess: false,
      formMessage: ''
    });

    try {
      const values = getValues();
      const owners = values.owners.map((o) => o.address);

      if (!chainId || !SafeSupportedChains.find((c) => c === chainId)) {
        showModal();
        return;
      }

      if (!active) {
        setState({
          formError: true,
          formMessage: 'Please login with metamask to setup safe'
        });
        return;
      }
      if (!user) {
        setState({
          formError: true,
          formMessage: 'Please sign up to deploy a safe'
        });
        return;
      }

      setTransactionStatus('PENDING');
      const safe = await deploySafe(library, owners, values.authorizedUsers);
      setTransactionStatus('IN_PROGRESS');

      await SafeApiService.addSafeWallet({
        organizationId: organizationId!,
        address: safe.getAddress(),
        chainId: chainId || 0,
        name: values.safeName || '',
        requiredConfirmations: values.authorizedUsers,
        owners: values.owners
      });

      setTransactionStatus('SUCCESS');
      onBack();
    } catch (error) {
      setTransactionStatus('ERROR');
      console.error(error);
    }
  };

  const addOwner = () => {
    append({ name: '', address: '', email: '' });
    setOptions(getValues('owners').length);
  };

  useEffect(() => {
    if (!chainId || !SafeSupportedChains.find((c) => c === chainId)) {
      hideModal();
    }
  }, [chainId]);

  return (
    <>
      <Form
        className="w-full"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        error={state.formError}
        success={state.formSuccess}
        message={state.formMessage}>
        <div className="grid md:grid-cols-3 py-5 gap-5 border-b border-neutral-200 mb-5">
          <Controller
            name="safeName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Safe name"
                placeholder="Enter safe name"
                className="md:col-span-3"
                error={Boolean(errors.safeName)}
                required
                message={errors.safeName ? 'Please enter safe name' : ''}
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
                rules={{ required: true, pattern: emailRegex }}
                render={({ field }) => (
                  <Input
                    label="Owner email"
                    placeholder="Enter owner email"
                    required
                    error={Boolean(getOwnersState(ownerIndex).email.state.error)}
                    message={
                      getOwnersState(ownerIndex).email.state.error?.type === 'pattern'
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
          <BackButton label={'Back'} onClick={onBack} />
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
      <ModalWrapper>
        <UnsupportedChainModal hideModal={hideModal} />
      </ModalWrapper>
    </>
  );
}
