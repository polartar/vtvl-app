import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Copy from '@components/atoms/Copy/Copy';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import FullPremintERC20Token from 'contracts/abi/FullPremintERC20Token.json';
import VariableSupplyERC20Token from 'contracts/abi/VariableSupplyERC20Token.json';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateToken } from 'services/db/token';
import { formatNumber, parseTokenAmount } from 'utils/token';

interface IAdditionalSupply {
  additionalTokens: number | '';
}

const defaultValues: IAdditionalSupply = {
  additionalTokens: ''
};

const MintSuppy: NextPageWithLayout = () => {
  const { library, account, activate } = useWeb3React();
  const { organizationId } = useAuthContext();
  const { mintFormState, tokenId } = useTokenContext();
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
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues
  });

  const { name, symbol, logo, decimals, initialSupply, supplyCap, maxSupply } = mintFormState;

  const additionalTokens = { value: watch('additionalTokens'), fieldState: getFieldState('additionalTokens') };
  const maxAllowableToMint = +maxSupply - +initialSupply;

  const handleMinChange = (e: any) => {
    setValue('additionalTokens', +e.target.value);
  };

  const onSubmit: SubmitHandler<IAdditionalSupply> = async (data) => {
    console.log('Submitting new supply', data);
    // Mint supply here
    try {
      // Connect to wallet first
      if (!library) {
        activate(injected);
      } else {
        const tokenTemplate = supplyCap === 'LIMITED' ? VariableSupplyERC20Token : FullPremintERC20Token;
        const TokenFactory = new ethers.ContractFactory(tokenTemplate.abi, tokenTemplate.bytecode, library.getSigner());

        const tokenContract =
          supplyCap === 'LIMITED'
            ? await TokenFactory.deploy(
                name,
                symbol,
                parseTokenAmount(+additionalTokens, decimals),
                parseTokenAmount(maxSupply, decimals)
              )
            : await TokenFactory.deploy(name, symbol, parseTokenAmount(+additionalTokens, decimals));
        await tokenContract.deployed();

        updateToken(
          {
            name: name,
            symbol: symbol,
            address: tokenContract.address,
            logo: logo,
            organizationId: organizationId!,
            createdAt: mintFormState.createdAt,
            updatedAt: Math.floor(new Date().getTime() / 1000),
            imported: mintFormState.imported,
            supplyCap: supplyCap,
            maxSupply: +maxSupply,
            initialSupply: +additionalTokens,
            status: mintFormState.status
          },
          tokenId
        );

        console.log('Deployed an ERC Token for testing.');
        console.log('Address:', tokenContract.address);
        toast.success('Additional tokens successfully minted!');
        return;
      }
    } catch (err) {
      console.log('err - ', err);
      toast.error('Additional tokens minting failed!');
      return;
    }
  };

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
        <TokenProfile {...mintFormState} className="mb-6" />
        <span className="paragraphy-medium-medium text-neutral-700">Contract address</span>
        <Copy text={mintFormState.address}>
          <p className="text-sm text-neutral-500 mb-2">{mintFormState.address}</p>
        </Copy>
        <div className="my-6 py-6 border-t border-b border-gray-200 grid grid-cols-3">
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Supply cap</p>
            <p className="text-neutral-500">{mintFormState.supplyCap}</p>
          </div>
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Minted amount</p>
            <p className="text-neutral-500">{formatNumber(+mintFormState.initialSupply)}</p>
          </div>
          <div className="font-medium text-sm">
            <p className="text-neutral-800">Maximum Supply</p>
            <p className="text-neutral-500">
              {mintFormState.supplyCap === 'LIMITED' ? formatNumber(+mintFormState.maxSupply) : mintFormState.supplyCap}
            </p>
          </div>
        </div>
        {mintFormState.supplyCap === 'UNLIMITED' ? (
          <Controller
            name="additionalTokens"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label={
                  <label className="required">
                    <span>Amount to be minted</span>
                  </label>
                }
                placeholder=""
                type="number"
                error={Boolean(errors.additionalTokens)}
                message={errors.additionalTokens ? 'Please enter amount to mint' : ''}
                {...field}
              />
            )}
          />
        ) : (
          <LimitedSupply
            label="Amount to be minted"
            maximumLabel="Unminted supply"
            required
            initial={+additionalTokens.value}
            maximum={+maxAllowableToMint}
            onMinChange={handleMinChange}
            onUseMax={() => setValue('additionalTokens', +maxAllowableToMint)}
            maxReadOnly
          />
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
            disabled={!+additionalTokens.value}
            className="flex flex-row items-center gap-2 primary group transition-all transform"
            type="submit">
            Create transaction
          </Button>
        </div>
      </Form>
    </div>
  );
};

MintSuppy.getLayout = function getLayout(page: ReactElement) {
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

export default MintSuppy;
