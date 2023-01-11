import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import DotLoader from '@components/atoms/DotLoader/DotLoader';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { Skeleton } from '@mui/material';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { injected } from 'connectors';
import FullPremintERC20Token from 'contracts/abi/FullPremintERC20Token.json';
import VariableSupplyERC20Token from 'contracts/abi/VariableSupplyERC20Token.json';
import { ethers } from 'ethers';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore/lite';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { db } from 'services/auth/firebase';
import { createToken, fetchTokenByQuery } from 'services/db/token';
import { formatNumber, parseTokenAmount } from 'utils/token';

const Summary: NextPageWithLayout = () => {
  const { organizationId } = useAuthContext();
  const { library, account, activate, chainId } = useWeb3React();
  const { mintFormState, updateMintFormState, updateTokenId } = useTokenContext();
  const { setTransactionStatus } = useTransactionLoaderContext();

  const { name, symbol, logo, decimals, initialSupply, supplyCap, maxSupply } = mintFormState;

  const [loading, setLoading] = useState(false);

  const handleCreateToken = async () => {
    try {
      if (!library) {
        activate(injected);
      } else if (organizationId && chainId) {
        setTransactionStatus('PENDING');
        setLoading(true);
        const tokenTemplate = supplyCap === 'LIMITED' ? FullPremintERC20Token : VariableSupplyERC20Token;
        const TokenFactory = new ethers.ContractFactory(tokenTemplate.abi, tokenTemplate.bytecode, library.getSigner());

        const tokenContract =
          supplyCap === 'UNLIMITED'
            ? await TokenFactory.deploy(
                name,
                symbol,
                parseTokenAmount(initialSupply, decimals),
                parseTokenAmount(maxSupply, decimals)
              )
            : await TokenFactory.deploy(name, symbol, parseTokenAmount(initialSupply, decimals));
        setTransactionStatus('IN_PROGRESS');
        await tokenContract.deployed();

        const tokenId = await createToken({
          name: name,
          symbol: symbol,
          address: tokenContract.address,
          logo: logo,
          organizationId: organizationId,
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          imported: false,
          supplyCap: supplyCap,
          maxSupply: maxSupply ? maxSupply : 0,
          initialSupply: initialSupply ? initialSupply : 0,
          status: 'SUCCESS',
          chainId
        });

        updateMintFormState({ ...mintFormState, address: tokenContract.address, status: 'SUCCESS', chainId });
        updateTokenId(tokenId);

        console.log('Address:', tokenContract.address);
        toast.success('Token created successfully');
        setLoading(false);
        setTransactionStatus('SUCCESS');
        Router.push('/minting-token/complete');
      }
    } catch (err) {
      console.log('handleCreateToken - ', err);
      setTransactionStatus('ERROR');
    }
  };

  useEffect(() => {
    if (!name) {
      Router.push('/minting-token');
    }
  }, [name]);

  return (
    <div className="panel rounded-lg mx-auto max-w-xl w-1/2 mt-14">
      <TokenProfile name={name} symbol={symbol} logo={logo} />
      <label className="mt-5">
        <span>Contract Address</span>
      </label>
      <Skeleton />
      {/* <progress
        value={
          supplyCap === 'LIMITED' ? (parseInt(initialSupply.toString()) / parseInt(maxSupply.toString())) * 100 : 100
        }
        max="100"
        className="w-full">
        75%
      </progress> */}
      <div className="border-y border-gray-300 mt-5 py-5 grid md:grid-cols-3">
        <label>
          <span>Supply cap</span>
          <p className="paragraphy-small-medium capitalize">{supplyCap.toLowerCase()}</p>
        </label>
        <label>
          <span>Amount to mint</span>
          <p className="paragraphy-small-medium">{formatNumber(+initialSupply)}</p>
        </label>
        <label>
          <span>Maximum amount</span>
          <p className="paragraphy-small-medium">{supplyCap === 'LIMITED' ? formatNumber(+maxSupply) : 'Unlimited'}</p>
        </label>
      </div>
      <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
        <BackButton label="Back to details" onClick={() => Router.push('/minting-token')} />
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
