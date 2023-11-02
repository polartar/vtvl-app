import { useWeb3React } from '@web3-react/core';
import VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ethers } from 'ethers';
import { IVestingContract } from 'interfaces/vestingContract';
import React, { useEffect, useState } from 'react';
import { SupportedChains } from 'types/constants/supported-chains';

function useIsAdmin(address: string, vestingContract?: IVestingContract) {
  const { chainId } = useWeb3React();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (address && vestingContract && chainId) {
      const VestingContract = new ethers.Contract(
        vestingContract?.address ?? '',
        VESTING_ABI.abi,
        ethers.getDefaultProvider(SupportedChains[chainId].rpc)
      );
      VestingContract.isAdmin(address).then((res: boolean) => setIsAdmin(res));
    }
  }, [address, vestingContract, chainId]);

  return isAdmin;
}

export default useIsAdmin;
