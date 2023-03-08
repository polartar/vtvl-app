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
import Decimal from 'decimal.js';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { formatNumber } from 'utils/token';

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
      ...mintFormState,
      initialSupplyText: '',
      maxSupplyText: ''
    }
  });

  // Watch for data changes from the input fields
  const name = { value: watch('name'), state: getFieldState('name') };
  const symbol = { value: watch('symbol'), state: getFieldState('symbol') };
  const supplyCap = { value: watch('supplyCap'), state: getFieldState('supplyCap') };
  const initialSupply = { value: watch('initialSupply'), state: getFieldState('initialSupply') };
  const initialSupplyText = { value: watch('initialSupplyText'), state: getFieldState('initialSupplyText') };
  const maxSupply = { value: watch('maxSupply'), state: getFieldState('maxSupply') };
  const maxSupplyText = { value: watch('maxSupplyText'), state: getFieldState('maxSupplyText') };

  // Updates made when the user is interacting with the Range Slider component
  // Should also update the text value -- for display -- of the number input
  const handleinitialSupplyChange = (e: any) => {
    const newValue = parseFloat(e.target.value);
    setValue('initialSupply', newValue);
    setValue('initialSupplyText', formatNumber(newValue).toString());
  };

  // Make sure that when the user clicks the "MAX" button, we update both the number and text values of the field
  const handleMaxMintAmouont = () => {
    const newMaxValue = parseFloat(maxSupply.value.toString());
    setValue('initialSupply', newMaxValue);
    setValue('initialSupplyText', formatNumber(newMaxValue).toString());
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
          The supply cap is the total number of tokens that can or ever will be minted. With an{' '}
          <strong>unlimited supply cap</strong> there isn't a cap on the number of tokens that can be minted and
          additional tokens can be minted at any time. Conversely, a <strong>limited supply cap</strong> does have a
          maximum number that can be minted. Additional tokens cannot be minted once the cap has been reached.
        </>
      )
    },
    {
      title: 'What is the maximum character length of token symbol?',
      description: (
        <>
          The token symbol can be up to 100 characters long and contain letters, numbers and special characters, but we
          think the shorter the better.
        </>
      )
    },
    {
      title: 'Is there a minimum amount of tokens that I need to mint?',
      description: (
        <>
          At least one token must be minted but you can mint more tokens in the future as long as it doesn't exceed your
          supply cap. However, we suggest that you mint enough tokens to fund any vesting schedules that you're
          creating.
        </>
      )
    },
    {
      title: "How do I determine how many tokens I'll need to fund my vesting schedules?",
      description: (
        <>
          Let's say you want to create a vesting schedule for new team members that started at your company this month.
          Each recipient is awarded 100 tokens over 4 years and there are a total of 4 new team members. To create this
          vesting schedule you'll need a total of 400 tokens - 4 (team members) X 100 (token allocation).
        </>
      )
    }
  ];

  // Add additional fields to contain the text value of the inputted numbers -- INITIAL SUPPLY AND MAX SUPPLY.
  // Then updating the numeric value based on the current value of the text
  useEffect(() => {
    // Parse the text into floats to cater the decimals if any
    const initialSupplyToFloat = parseFloat(initialSupplyText.value.replaceAll(',', ''));
    const maxSupplyToFloat = parseFloat(maxSupplyText.value.replaceAll(',', ''));
    setValue('initialSupply', !isNaN(initialSupplyToFloat) ? initialSupplyToFloat : 0);
    setValue('maxSupply', !isNaN(maxSupplyToFloat) ? maxSupplyToFloat : 0);
  }, [initialSupplyText.value, maxSupplyText.value]);

  return (
    <>
      <div className="grid md:grid-cols-12 w-full gap-6 mt-14 w-full max-w-6xl">
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
                    message={errors.name ? 'Please enter token name' : ''}
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
                    message={errors.symbol ? 'Please enter token symbol' : ''}
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
                  name="maxSupplyText"
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
                      placeholder="Enter amount"
                      type="number"
                      error={Boolean(errors.maxSupply)}
                      message={errors.maxSupply ? 'Please enter the initial total supply' : ''}
                      {...field}
                    />
                  )}
                />
              ) : null}
              <div className="relative">
                <Controller
                  name="initialSupplyText"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      label={
                        <label className="required">
                          <span>Amount to mint </span>
                        </label>
                      }
                      placeholder="Enter amount"
                      type="number"
                      error={
                        Boolean(errors.initialSupply) ||
                        (initialSupply.value > maxSupply.value && supplyCap.value === 'LIMITED')
                      }
                      message={
                        errors.initialSupply
                          ? 'Please enter amount to mint'
                          : initialSupply.value > maxSupply.value && supplyCap.value === 'LIMITED'
                          ? 'Amount to mint should be smaller than the maximum amount'
                          : ''
                      }
                      {...field}
                    />
                  )}
                />
                {supplyCap.value === 'LIMITED' ? (
                  <Chip
                    label="MAX"
                    color={+initialSupply.value < +maxSupply.value ? 'secondary' : 'default'}
                    onClick={handleMaxMintAmouont}
                    className={`absolute right-6 cursor-pointer ${
                      initialSupply.value > maxSupply.value || errors.initialSupply ? 'bottom-9' : 'bottom-2'
                    }`}
                  />
                ) : null}
              </div>
              {supplyCap.value === 'LIMITED' ? (
                <div className="mt-6">
                  <RangeSlider
                    max={maxSupply.value ? maxSupply.value : 0}
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
