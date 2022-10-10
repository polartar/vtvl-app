import CollapsibleContent from '@components/atoms/CollapsibleContent/CollapsibleContent';
import Input from '@components/atoms/FormControls/Input/Input';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import Uploader from '@components/atoms/Uploader/Uploader';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface FormTypes {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  supplyCap: string;
  amountToMint: number;
}

const MintingToken: NextPageWithLayout = () => {
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    formState: { errors, isSubmitted }
  } = useForm({
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenLogo: '',
      supplyCap: 'unlimited',
      amountToMint: 500000,
      initialSupply: 1
    }
  });

  // Watch for data changes from the input fields
  const tokenName = { value: watch('tokenName'), state: getFieldState('tokenName') };
  const tokenSymbol = { value: watch('tokenSymbol'), state: getFieldState('tokenSymbol') };
  const tokenLogo = { value: watch('tokenSymbol'), state: getFieldState('tokenLogo') };
  const supplyCap = { value: watch('supplyCap'), state: getFieldState('supplyCap') };
  const amountToMint = { value: watch('amountToMint'), state: getFieldState('amountToMint') };
  const initialSupply = { value: watch('initialSupply'), state: getFieldState('initialSupply') };

  const handleMinChange = (e: any) => {
    console.log('Min changed', e.target.value);
    setValue('initialSupply', e.target.value);
  };

  const handleMaxChange = (e: any) => {
    console.log('Max changed', e.target.value);
    setValue('amountToMint', e.target.value);
  };

  // Handle the submit of the form
  const onSubmit: SubmitHandler<FormTypes> = (data) => {
    console.log('Form Submitted', data, getValues());
    Router.push('/vesting-schedule/minting-token/summary');
  };

  const collapsibleContents = [
    {
      title: "What's the difference between an unlimited and limited supply cap?",
      description:
        "Unlimited supply cap indicates that there isn't a cap on the total token supply. Whereas a fixed supply cap is a fixed number of total tokens that have been (or will be) created."
    },
    {
      title: 'What is the maximum character length of token symbol?',
      description:
        "Unlimited supply cap indicates that there isn't a cap on the total token supply. Whereas a fixed supply cap is a fixed number of total tokens that have been (or will be) created."
    },
    {
      title: 'What is supply type?',
      description:
        "Unlimited supply cap indicates that there isn't a cap on the total token supply. Whereas a fixed supply cap is a fixed number of total tokens that have been (or will be) created."
    }
  ];

  return (
    <>
      <div className="grid md:grid-cols-12 w-full gap-3.5 mt-14">
        <div className="md:col-span-7">
          <form className="w-full mb-6 panel" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <Controller
                name="tokenName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Token name"
                    placeholder="Enter token name"
                    error={Boolean(errors.tokenName)}
                    success={!errors.tokenName && (tokenName.state.isTouched || tokenName.state.isDirty) && isSubmitted}
                    message={
                      errors.tokenName
                        ? 'Please enter token name'
                        : (tokenName.state.isTouched || tokenName.state.isDirty) && isSubmitted
                        ? 'Token name is okay'
                        : ''
                    }
                    {...field}
                  />
                )}
              />
              <Controller
                name="tokenSymbol"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Token symbol"
                    placeholder="Enter token symbol"
                    error={Boolean(errors.tokenSymbol)}
                    success={
                      !errors.tokenSymbol && (tokenSymbol.state.isTouched || tokenSymbol.state.isDirty) && isSubmitted
                    }
                    message={
                      errors.tokenSymbol
                        ? 'Please enter token symbol'
                        : (tokenSymbol.state.isTouched || tokenSymbol.state.isDirty) && isSubmitted
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
                name="tokenLogo"
                control={control}
                render={({ field }) => <Uploader label="Token logo" {...field} />}
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
                    description="No limit in the amount of tokens in circulation"
                    checked={supplyCap.value === 'unlimited'}
                    {...field}
                    value="unlimited"
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
                    checked={supplyCap.value === 'limited'}
                    {...field}
                    value="limited"
                  />
                )}
              />
            </div>
            <div className="border-t border-neutral-200 py-5">
              {supplyCap.value === 'limited' ? (
                <LimitedSupply
                  label="Amount to mint"
                  required
                  initial={initialSupply.value}
                  maximum={amountToMint.value}
                  onMinChange={handleMinChange}
                  onMaxChange={handleMaxChange}
                  onUseMax={() => setValue('initialSupply', amountToMint.value)}
                />
              ) : (
                <Controller
                  name="amountToMint"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      label="Amount to mint"
                      placeholder="500000"
                      type="number"
                      error={Boolean(errors.amountToMint)}
                      success={
                        !errors.amountToMint &&
                        (amountToMint.state.isTouched || amountToMint.state.isDirty) &&
                        isSubmitted
                      }
                      message={
                        errors.amountToMint
                          ? 'Please enter amount to mint'
                          : (amountToMint.state.isTouched || amountToMint.state.isDirty) && isSubmitted
                          ? 'Amount to min is okay'
                          : ''
                      }
                      {...field}
                    />
                  )}
                />
              )}
            </div>
            <div className="flex flex-row justify-end items-center border-t border-neutral-200 pt-5">
              <button className="primary" type="submit">
                Continue
              </button>
            </div>
          </form>
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
    { title: 'Vesting schedule', route: 'vesting-schedule' },
    { title: 'Minting token', route: 'minting-token' }
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
