import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import DotLoader from '@components/atoms/DotLoader/DotLoader';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { injected } from 'connectors';
import FullPremintERC20Token from 'contracts/abi/FullPremintERC20Token.json';
import VariableSupplyERC20Token from 'contracts/abi/VariableSupplyERC20Token.json';
import { ethers } from 'ethers';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore/lite';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useMintContext } from 'providers/mint.context';
import { ReactElement, useEffect } from 'react';
import { useState } from 'react';
import { db } from 'services/auth/firebase';
import { createToken } from 'services/db/token';
import { parseTokenAmount } from 'utils/token';

const Summary: NextPageWithLayout = () => {
  const { library, account, activate } = useWeb3React();
  const { mintFormState, updateMintFormState } = useMintContext();

  const { tokenName, tokenSymbol, tokenLogo, decimals, mintAmount, supplyCap, initialSupply } = mintFormState;

  const [loading, setLoading] = useState(false);

  const handleCreateToken = async () => {
    try {
      if (!library) {
        activate(injected);
      } else {
        setLoading(true);
        const tokenTemplate = supplyCap === 'LIMITED' ? VariableSupplyERC20Token : FullPremintERC20Token;
        const TokenFactory = new ethers.ContractFactory(tokenTemplate.abi, tokenTemplate.bytecode, library.getSigner());

        const tokenContract =
          supplyCap === 'LIMITED'
            ? await TokenFactory.deploy(
                tokenName,
                tokenSymbol,
                parseTokenAmount(mintAmount, decimals),
                parseTokenAmount(initialSupply, decimals)
              )
            : await TokenFactory.deploy(tokenName, tokenSymbol, parseTokenAmount(mintAmount, decimals));
        await tokenContract.deployed();

        updateMintFormState({ ...mintFormState, contractAddress: tokenContract.address });

        createToken({
          name: tokenName,
          symbol: tokenSymbol,
          address: tokenContract.address,
          logo: tokenLogo,
          organization_id: '',
          created_at: Math.floor(new Date().getTime() / 1000),
          updated_at: Math.floor(new Date().getTime() / 1000),
          imported: false,
          supply_cap: supplyCap,
          max_supply: initialSupply ? initialSupply : 0,
          initial_supply: mintAmount ? mintAmount : 0
        });

        console.log('Deployed an ERC Token for testing.');
        console.log('Address:', tokenContract.address);
        setLoading(false);
        Router.push('/minting-token/complete');
      }
    } catch (err) {
      console.log('err - ', err);
    }
  };

  useEffect(() => {
    if (!tokenName) {
      Router.push('/minting-token');
    }
  }, [tokenName]);

  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-1/2 mt-14">
      <TokenProfile name={tokenName} symbol={tokenSymbol} logo={tokenLogo} />
      <label className="mt-5">
        <span>Contract Address</span>
      </label>
      <progress
        value={
          supplyCap === 'LIMITED' ? (parseInt(mintAmount.toString()) / parseInt(initialSupply.toString())) * 100 : 100
        }
        max="100"
        className="w-full">
        75%
      </progress>
      <div className="border-y border-gray-300 mt-5 py-5 grid md:grid-cols-3">
        <label>
          <span>Supply cap</span>
          <p className="text-sm font-medium text-neutral-500 capitalize">{supplyCap.toLowerCase()}</p>
        </label>
        <label>
          <span>Amount to mint</span>
          <p className="text-sm font-medium text-neutral-500">{mintAmount}</p>
        </label>
        <label>
          <span>Maximum supply</span>
          <p className="text-sm font-medium text-neutral-500">
            {supplyCap === 'LIMITED' ? initialSupply : 'Unlimited'}
          </p>
        </label>
      </div>
      <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
        <BackButton label="Return to details" onClick={() => Router.push('/minting-token')} />
        <Button className="primary" type="button" onClick={handleCreateToken} loading={loading}>
          Create transaction
        </Button>
      </div>
    </div>
  );
};

Summary.getLayout = function getLayout(page: ReactElement) {
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
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={1}>
      {page}
    </SteppedLayout>
  );
};

export default Summary;
