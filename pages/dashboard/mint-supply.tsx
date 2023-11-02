import TokenApiService from '@api-services/TokenApiService';
import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import RangeSlider from '@components/atoms/FormControls/RangeSlider/RangeSlider';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VariableSupplyERC20Token from 'contracts/abi/VariableSupplyERC20Token.json';
import parse from 'date-fns/parse';
import { ethers } from 'ethers';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { formatNumber } from 'utils/token';

interface IAdditionalSupply {
  additionalTokens: number | '';
  additionalTokensText: string;
}

const defaultValues: IAdditionalSupply = {
  additionalTokens: '',
  additionalTokensText: ''
};

const MintSupply: NextPageWithLayout = () => {
  const { library, account, activate, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();
  const { transactionStatus, setTransactionStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { mintFormState, tokenId, updateMintFormState } = useTokenContext();
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues
  });

  const { name, symbol, logo, decimal, totalSupply, supplyCap, maxSupply } = mintFormState;

  const additionalTokens = { value: watch('additionalTokens'), fieldState: getFieldState('additionalTokens') };
  const additionalTokensText = {
    value: watch('additionalTokensText'),
    fieldState: getFieldState('additionalTokensText')
  };
  const maxAllowableToMint = +maxSupply! - +totalSupply!;

  const handleMinChange = (e: any) => {
    setValue('additionalTokens', +e.target.value);
  };

  const onSubmit: SubmitHandler<IAdditionalSupply> = async (data) => {
    console.log('Submitting new supply', data);
    setIsCloseAvailable(false);
    // Mint supply here
    try {
      // Connect to wallet first
      if (!library || !chainId) {
        activate(injected);
      } else if (
        mintFormState.address &&
        !mintFormState.isImported &&
        mintFormState.supplyCap === 'UNLIMITED' &&
        Number(additionalTokens.value) > 0
      ) {
        setTransactionStatus('PENDING');
        const tokenContract = new ethers.Contract(
          mintFormState.address,
          VariableSupplyERC20Token.abi,
          library.getSigner()
        );
        const mintTx = await tokenContract.mint(
          account,
          ethers.utils.parseEther(additionalTokens.value.toString()).toString()
        );
        setTransactionStatus('IN_PROGRESS');
        await mintTx.wait();

        // ATTENTION: this might need to be updated to support the new API integration for token details
        await TokenApiService.updateToken(tokenId, {
          organizationId: organizationId!,
          totalSupply: (+additionalTokens.value + +totalSupply!).toString()
        });

        updateMintFormState({
          ...mintFormState,
          totalSupply: +additionalTokens.value + +totalSupply!
        });

        console.log('Deployed an ERC Token for testing.');
        console.log('Address:', tokenContract.address);
        toast.success('Additional tokens successfully minted!');
        setTransactionStatus('SUCCESS');
        setTimeout(() => {
          Router.push('/dashboard');
        }, 1000);
        return;
      }
    } catch (err: any) {
      console.log('err - ', err);
      toast.error('Additional tokens minting failed!');
      if (err.code === 'ACTION_REJECTED') {
        setTransactionStatus('REJECTED');
      } else {
        setTransactionStatus('ERROR');
      }
      setTimeout(() => {
        Router.push('/dashboard');
      }, 1000);
      return;
    }
  };

  // Handles the clicking of the "MAX" button in the amount to be minted section
  const handleMaxAmount = () => {
    const newMaxValue = maxAllowableToMint;
    setValue('additionalTokens', newMaxValue);
    setValue('additionalTokensText', formatNumber(newMaxValue).toString());
    clearErrors('additionalTokensText');
  };

  // Updates made when the user is interacting with the Range Slider component
  // Should also update the text value -- for display -- of the number input
  const handleAmountToBeMintedChange = (e: any) => {
    const newValue = parseFloat(e.target.value);
    setValue('additionalTokens', newValue);
    setValue('additionalTokensText', formatNumber(newValue).toString());
    clearErrors('additionalTokensText');
  };

  // Update the actual numbers based on the formatted ones
  useEffect(() => {
    const additionalTokensToFloat = parseFloat(additionalTokensText.value.replaceAll(',', ''));
    setValue('additionalTokens', !isNaN(additionalTokensToFloat) ? additionalTokensToFloat : 0);
  }, [additionalTokensText.value]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg">
      <h1 className="text-neutral-900">Mint additional tokens</h1>
      <Form
        isSubmitting={isSubmitting}
        error={formError}
        success={formSuccess}
        message={formMessage}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full my-6">
        <TokenProfile {...mintFormState} burnable={false} className="mb-6" />
        <span className="paragraphy-medium-medium text-neutral-700">Contract address</span>
        <Copy text={mintFormState.address!}>
          <p className="text-sm text-neutral-500 mb-2">{mintFormState.address}</p>
        </Copy>
        <div className="my-6 py-6 border-t border-b border-gray-200 grid grid-cols-3">
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Supply cap</p>
            <p className="text-neutral-500">{mintFormState.supplyCap}</p>
          </div>
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Minted amount</p>
            <p className="text-neutral-500">{formatNumber(+mintFormState.totalSupply!)}</p>
          </div>
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Maximum Supply</p>
            <p className="text-neutral-500">
              {mintFormState.supplyCap === 'LIMITED'
                ? formatNumber(+mintFormState.maxSupply!)
                : mintFormState.supplyCap}
            </p>
          </div>
        </div>
        {mintFormState.supplyCap === 'UNLIMITED' ? (
          <Controller
            name="additionalTokensText"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label={
                  <label className="required">
                    <span>Amount to be minted</span>
                  </label>
                }
                placeholder="Enter amount"
                type="number"
                error={Boolean(errors.additionalTokensText) || Number(additionalTokens.value) <= 0}
                message={errors.additionalTokensText ? 'Please enter amount to mint' : ''}
                {...field}
              />
            )}
          />
        ) : (
          <>
            <div className="relative">
              <Controller
                name="additionalTokensText"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    <label className="required w-full">
                      <div className="flex flex-row items-center justify-between gap-3 w-full">
                        <span className="form-label required">Amount to be minted</span>
                        <p className="text-xs font-medium text-neutral-700">
                          Unminted supply: {formatNumber(maxAllowableToMint)}
                        </p>
                      </div>
                    </label>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      max={maxAllowableToMint}
                      error={
                        Boolean(errors.additionalTokensText) || Number(additionalTokens.value) > maxAllowableToMint
                      }
                      message={errors.additionalTokensText ? 'Please enter amount to be vested' : ''}
                      {...field}
                    />
                  </>
                )}
              />
              <Chip
                label="MAX"
                color={Number(additionalTokens.value) < maxAllowableToMint ? 'secondary' : 'default'}
                onClick={handleMaxAmount}
                className={`absolute right-6 cursor-pointer ${
                  Number(additionalTokens.value) > maxAllowableToMint || errors.additionalTokensText
                    ? 'bottom-9'
                    : 'bottom-2'
                }`}
              />
            </div>
            <div className="mt-6">
              <RangeSlider
                max={maxAllowableToMint || 0}
                value={additionalTokens.value ? additionalTokens.value : 0}
                className="mt-5"
                onChange={handleAmountToBeMintedChange}
              />
            </div>
          </>
        )}
        <div className="flex flex-row justify-between items-center border-t border-gray-200 pt-5 mt-6">
          <BackButton
            label="Back to dashboard"
            onClick={() => {
              Router.push('/dashboard');
            }}
          />
          <Button
            loading={isSubmitting}
            disabled={Number(additionalTokens.value) <= 0}
            className="flex flex-row items-center gap-2 primary group transition-all transform"
            type="submit">
            Create transaction
          </Button>
        </div>
      </Form>
    </div>
  );
};

MintSupply.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Mint supply', route: '/dashboard/mint-supply' }
  ];
  return (
    <SteppedLayout title="Mint supply" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default MintSupply;
