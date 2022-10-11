import Safe, { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { OwnerResponse } from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useState } from 'react';

const MultiSigWallet = () => {
  const { library, account } = useWeb3React();
  const [multisig, setMultiSig] = useState<Safe>();

  const createWallet = async () => {
    const ethAdapter = new EthersAdapter({
      ethers: ethers,
      signer: library?.getSigner(0)
    });

    const safeFactory = await SafeFactory.create({ ethAdapter });

    const safeService = new SafeServiceClient({
      txServiceUrl: 'https://safe-transaction.gnosis.io',
      ethAdapter
    });

    if(account) {
      const safes: OwnerResponse = await safeService.getSafesByOwner(account)
    }

    const owners = ['0xF6F193B066039DE07df05bb31Afe36524C15fd5F', '0x82B647063A076d08c862058c2c114ac20d522653'];
    const threshold = 2;
    const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold
      // ...
    };

    const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
    setMultiSig(safeSdk);
    console.log('safe created here is ', safeSdk.getAddress());
    console.log('safe balance here is ', safeSdk.getBalance());
  };

  return <>{!multisig && <button onClick={() => createWallet()}>Create MultiSig Wallet</button>}</>;
};

export default MultiSigWallet;
