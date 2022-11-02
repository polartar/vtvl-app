import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import TokenDetails from '@components/atoms/TokenDetails/TokenDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { ReactElement, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { createToken } from 'services/db/token';

interface IImportToken {
  tokenAddress: string;
}

const DashboardImportToken: NextPageWithLayout = () => {
  const { organizationId } = useAuthContext();

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
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<IImportToken> = async (data) => {
    // Place integration codes here for truly importing the token
    console.log('Submitted the data', data);

    // These are just a samples, remove or modify this when doing the integration.
    if (!tokenAddress.value || tokenAddress.value.length !== 42) {
      setError(true);
      setMessage('Token address is invalid');
    } else if (tokenName) {
      setLoading(true);
      const tokenRefId = await createToken({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        address: tokenAddress.value,
        logo: '',
        organizationId: organizationId!,
        imported: true,
        createdAt: Math.floor(new Date().getTime() / 1000),
        updatedAt: Math.floor(new Date().getTime() / 1000),
        supplyCap: 'UNLIMITED',
        status: 'SUCCESS'
      });
      setLoading(false);
    }
  };

  const resetFormStates = () => {
    setError(false);
    setSuccess(false);
    setMessage('');
  };

  const fetchTokenDetails = async () => {
    setLoading(true);
    setError(false);
    setMessage('');
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress.value,
        [
          // Read-Only Functions
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'function name() view returns (string)'
        ],
        ethers.getDefaultProvider(
          `https://${process.env.NEXT_PUBLIC_TEST_NETWORK_NAME}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
        )
      );
      const symbol = await tokenContract.symbol();
      const name = await tokenContract.name();
      const decimals = await tokenContract.decimals();
      setTokenName(name);
      setTokenSymbol(symbol);
      setTokenDecimals(decimals);
      setError(false);
      setMessage('');
    } catch (err) {
      setError(true);
      setMessage("Token with that address doesn't exist");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tokenAddress.value && tokenAddress.value.length === 42) {
      fetchTokenDetails();
    } else {
      setTokenName('');
      setTokenSymbol('');
      setTokenDecimals(18);

      if (tokenAddress.value) {
        setError(true);
        setMessage('Token address is invalid');
      } else {
        setError(false);
        setMessage('');
      }
    }
  }, [tokenAddress.value]);

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
          Please confirm the token address below to make sure it's the correct token.
        </p>
        <Controller
          name="tokenAddress"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <Input icon="/images/chain-icons.png" {...field} />}
        />
        {/* Search for the token address to get the Token name after below */}
        {tokenAddress.value && tokenAddress.value.length === 42 && tokenName ? (
          <div className="border-t border-gray-200 mt-5 py-5">
            <TokenDetails
              title={`${tokenName} - ${tokenSymbol}`}
              address={tokenAddress.value}
              url={`https://${
                process.env.NEXT_PUBLIC_TEST_NETWORK_NAME === 'mainnet'
                  ? ''
                  : `${process.env.NEXT_PUBLIC_TEST_NETWORK_NAME}.`
              }etherscan.io/token/${tokenAddress.value}`}
            />
          </div>
        ) : null}
        <div className="flex flex-row justify-between items-center border-t border-gray-200 pt-5 mt-6">
          <BackButton
            label="Back"
            onClick={() => {
              Router.push('/dashboard');
            }}
          />
          <Button
            loading={isSubmitting || loading}
            disabled={!tokenAddress.value || error}
            className="flex flex-row items-center gap-2 primary group transition-all transform"
            type="submit">
            Add your token
          </Button>
        </div>
      </Form>
    </div>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
DashboardImportToken.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Import token', route: '/dashboard/import-token' }
  ];
  return (
    <SteppedLayout title="Import token" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default DashboardImportToken;