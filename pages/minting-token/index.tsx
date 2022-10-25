import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import CollapsibleContent from '@components/atoms/CollapsibleContent/CollapsibleContent';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import RangeSlider from '@components/atoms/FormControls/RangeSlider/RangeSlider';
import Uploader from '@components/atoms/Uploader/Uploader';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface FormTypes {
  name: string;
  symbol: string;
  logo: string;
  supplyCap: string;
  initialSupply: number | '';
}

const MintingToken: NextPageWithLayout = () => {
  const { mintFormState, updateMintFormState } = useTokenContext();
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    formState: { errors, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: {
      ...mintFormState
    }
  });

  // Watch for data changes from the input fields
  const name = { value: watch('name'), state: getFieldState('name') };
  const symbol = { value: watch('symbol'), state: getFieldState('symbol') };
  const supplyCap = { value: watch('supplyCap'), state: getFieldState('supplyCap') };
  const initialSupply = { value: watch('initialSupply'), state: getFieldState('initialSupply') };
  const maxSupply = { value: watch('maxSupply'), state: getFieldState('maxSupply') };

  const handleinitialSupplyChange = (e: any) => {
    setValue('initialSupply', e.target.value);
  };

  const handleMaxMintAmouont = () => {
    setValue('maxSupply', maxSupply.value);
  };

  const handleUpload = (url: string) => {
    setValue('logo', url);
  };

  // Handle the submit of the form
  const onSubmit: SubmitHandler<FormTypes> = (data) => {
    setFormSuccess(false);
    setFormError(false);
    setFormMessage('');

    // If at some point here something went wrong
    // setFormMessage('Oh no! Something went wrong!!');
    // setFormError(true);
    // return;

    updateMintFormState({ ...mintFormState, ...data });
    Router.push('/minting-token/summary');
    return;
  };

  const collapsibleContents = [
    {
      title: "What's the difference between an unlimited and limited supply cap?",
      description: (
        <>
          <strong>Unlimited supply cap</strong> indicates that there isn't a cap on the total token supply. Whereas a
          fixed supply cap is a fixed number of total tokens that have been (or will be) created.
        </>
      )
    },
    {
      title: 'What is the maximum character length of token symbol?',
      description: (
        <>
          <strong>Unlimited supply cap</strong> indicates that there isn't a cap on the total token supply. Whereas a
          fixed supply cap is a fixed number of total tokens that have been (or will be) created.
        </>
      )
    },
    {
      title: 'What is supply type?',
      description: (
        <>
          <strong>Unlimited supply cap</strong> indicates that there isn't a cap on the total token supply. Whereas a
          fixed supply cap is a fixed number of total tokens that have been (or will be) created.
        </>
      )
    }
  ];

  return (
    <>
      <div className="grid md:grid-cols-12 w-full gap-3.5 mt-14">
        <div className="md:col-span-7">
          <Form
            className="w-full mb-6"
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            error={formError}
            success={formSuccess}
            message={formMessage}>
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Token name"
                    placeholder="Enter token name"
                    required
                    error={Boolean(errors.name)}
                    success={!errors.name && (name.state.isTouched || name.state.isDirty) && isSubmitted}
                    message={
                      errors.name
                        ? 'Please enter token name'
                        : (name.state.isTouched || name.state.isDirty) && isSubmitted
                        ? 'Token name is okay'
                        : ''
                    }
                    {...field}
                  />
                )}
              />
              <Controller
                name="symbol"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Token symbol"
                    placeholder="Enter token symbol"
                    required
                    error={Boolean(errors.symbol)}
                    success={!errors.symbol && (symbol.state.isTouched || symbol.state.isDirty) && isSubmitted}
                    message={
                      errors.symbol
                        ? 'Please enter token symbol'
                        : (symbol.state.isTouched || symbol.state.isDirty) && isSubmitted
                        ? 'Token symbol is okay'
                        : ''
                    }
                    {...field}
                  />
                )}
              />
            </div>
            <div className="border-t border-neutral-200 py-5">
              <Controller
                name="logo"
                control={control}
                render={({ field }) => <Uploader label="Token logo" onUpload={handleUpload} />}
              />
            </div>
            <div className="border-t border-neutral-200 py-5">
              <label className="required">
                <span>Supply cap</span>
              </label>
              <Controller
                name="supplyCap"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Radio
                    label="Unlimited"
                    description="No limit on the amount of tokens in circulation"
                    checked={supplyCap.value === 'UNLIMITED'}
                    {...field}
                    value="UNLIMITED"
                  />
                )}
              />
              <Controller
                name="supplyCap"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Radio
                    label="Limited"
                    description="Fixed amount of tokens ever in circulation"
                    checked={supplyCap.value === 'LIMITED'}
                    {...field}
                    value="LIMITED"
                  />
                )}
              />
            </div>
            <div className="border-t border-neutral-200 py-5">
              {supplyCap.value === 'LIMITED' ? (
                <Controller
                  name="maxSupply"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      className="mb-5"
                      label={
                        <label className="required">
                          <span>Maximum amount of tokens</span>
                        </label>
                      }
                      placeholder=""
                      type="number"
                      error={Boolean(errors.maxSupply)}
                      success={
                        !errors.maxSupply && (maxSupply.state.isTouched || maxSupply.state.isDirty) && isSubmitted
                      }
                      message={
                        errors.maxSupply
                          ? 'Please enter the initial total supply'
                          : (maxSupply.state.isTouched || maxSupply.state.isDirty) && isSubmitted
                          ? 'Initial total supply is ok'
                          : ''
                      }
                      {...field}
                    />
                  )}
                />
              ) : null}
              <div className="relative">
                <Controller
                  name="initialSupply"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      label={
                        <label className="required">
                          <span>Amount to mint</span>
                        </label>
                      }
                      placeholder=""
                      type="number"
                      error={
                        Boolean(errors.initialSupply) ||
                        (initialSupply.value > maxSupply.value && supplyCap.value === 'LIMITED')
                      }
                      success={
                        !errors.initialSupply &&
                        (initialSupply.state.isTouched || initialSupply.state.isDirty) &&
                        isSubmitted
                      }
                      message={
                        errors.initialSupply
                          ? 'Please enter amount to mint'
                          : initialSupply.value > maxSupply.value && supplyCap.value === 'LIMITED'
                          ? 'Amount to mint should be smaller than the maximum amount'
                          : (initialSupply.state.isTouched || initialSupply.state.isDirty) && isSubmitted
                          ? 'Amount to min is okay'
                          : ''
                      }
                      {...field}
                    />
                  )}
                />
                {supplyCap.value === 'LIMITED' ? (
                  <Chip
                    label="MAX"
                    color="secondary"
                    onClick={handleMaxMintAmouont}
                    className="absolute right-6 bottom-4"
                  />
                ) : null}
              </div>
              {supplyCap.value === 'LIMITED' ? (
                <div className="mt-6">
                  <RangeSlider
                    max={initialSupply.value ? initialSupply.value : 0}
                    value={initialSupply.value ? initialSupply.value : 0}
                    className="mt-5"
                    onChange={handleinitialSupplyChange}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-row justify-end items-center border-t border-neutral-200 pt-5">
              <Button className="primary" type="submit" loading={isSubmitting}>
                Continue
              </Button>
            </div>
          </Form>
        </div>
        <div className="md:col-span-5">
          <label className="text-sm font-semibold text-secondary-900 mb-3">Support</label>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">FAQs</h2>
          <p className="text-lg font-medium text-gray-500 mb-12">
            Everything you need to know about token minting. Can&apos;t find the answer you&apos;re looking for? Please
            chat to our friendly team.
          </p>
          {collapsibleContents.map((content, contentIndex) => (
            <CollapsibleContent
              key={`content-${contentIndex}`}
              title={content.title}
              description={content.description}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Assign a stepped layout
MintingToken.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Minting token', route: '/minting-token' }
  ];

  // Update these into a state coming from the context
  const mintingSteps = [
    {
      title: 'Token details',
      desc: 'Setup your token details'
    },
    {
      title: 'Token summary',
      desc: 'Please review the details'
    },
    {
      title: 'Finished',
      desc: 'Token created successfully!'
    }
  ];
  return (
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={0}>
      {page}
    </SteppedLayout>
  );
};

export default MintingToken;
