import BackButton from '@components/atoms/BackButton/BackButton';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import TokenDetails from '@components/atoms/TokenDetails/TokenDetails';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface IImportToken {
  tokenAddress: string;
}

const DashboardImportToken = () => {
  const defaultValues: IImportToken = {
    tokenAddress: ''
  };
  const {
    control,
    getFieldState,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({ defaultValues });

  const tokenAddress = { value: watch('tokenAddress'), state: getFieldState('tokenAddress') };

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit: SubmitHandler<IImportToken> = async (data) => {
    // Place integration codes here for truly importing the token
    console.log('Submitted the data', data);

    // These are just a samples, remove or modify this when doing the integration.
    setError(true);
    setMessage('SAMPLE error if in any case. Oh no!');

    setTimeout(() => {
      setError(false);
      setSuccess(true);
      setMessage('SAMPLE success after Alright! back online!');

      setTimeout(() => {
        resetFormStates();
        reset();
      }, 4000);
    }, 3000);
  };

  const resetFormStates = () => {
    setError(false);
    setSuccess(false);
    setMessage('');
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Import an existing ERC-20 token</h1>
      <Form
        isSubmitting={isSubmitting}
        error={error}
        success={success}
        message={message}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full my-6">
        <span className="paragraphy-medium-medium text-neutral-700">Token address</span>
        <p className="text-sm text-neutral-500 mb-2">
          Please confirm the token details below to make sure it's the correct token.
        </p>
        <Controller
          name="tokenAddress"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <Input icon="/images/chain-icons.png" {...field} />}
        />
        {/* Search for the token address to get the Token name after below */}
        {tokenAddress.value ? (
          <div className="border-t border-gray-200 mt-5 py-5">
            <TokenDetails
              title="BICO - Biconomy"
              address="0xf17e65822b568b3903685a7c9f496cf7656cc6c2"
              url="https://etherscan.io/token/0xf17e65822b568b3903685a7c9f496cf7656cc6c2"
            />
          </div>
        ) : null}
        <div className="flex flex-row justify-between items-center border-t border-gray-200 pt-5 mt-6">
          <BackButton label="Back" onClick={() => {}} />
          <button
            disabled={!tokenAddress.value}
            className="flex flex-row items-center gap-2 primary group transition-all transform"
            type="submit">
            Add token
          </button>
        </div>
      </Form>
    </div>
  );
};

export default DashboardImportToken;
