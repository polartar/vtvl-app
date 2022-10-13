import BackButton from '@components/atoms/BackButton/BackButton';
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
import { ReactElement } from 'react';
import { db } from 'services/auth/firebase';
import { parseTokenAmount } from 'utils/token';

const Summary: NextPageWithLayout = () => {
  const { library, account, activate } = useWeb3React();
  const { mintFormState, updateMintFormState } = useMintContext();

  const { tokenName, tokenSymbol, tokenLogo, decimals, mintAmount, supplyCap, initialSupply } = mintFormState;

  const handleCreateToken = async () => {
    try {
      if (!library) {
        activate(injected);
      } else {
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

        const tokensCollection = collection(db, 'tokens');
        addDoc(tokensCollection, {
          address: tokenContract.address,
          owner: account,
          logo: tokenLogo
        });

        console.log('Deployed an ERC Token for testing.');
        console.log('Address:', tokenContract.address);
        Router.push('/minting-token/complete');
      }
    } catch (err) {
      console.log('err - ', err);
    }
  };

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
        <BackButton label="Return to details" href="/vesting-schedule/minting-token" />
        <button className="primary" type="button" onClick={handleCreateToken}>
          Create token
        </button>
      </div>
    </div>
  );
};

Summary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Dashboard', route: '/' },
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
    <SteppedLayout title="Mint token" steps={mintingSteps} crumbs={crumbSteps} currentStep={1}>
      {page}
    </SteppedLayout>
  );
};

export default Summary;
