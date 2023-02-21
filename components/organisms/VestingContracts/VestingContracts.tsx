import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { ethers } from 'ethers';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import { useModal } from 'hooks/useModal';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import React, { useCallback } from 'react';
import { useMemo } from 'react';
import { compareAddresses } from 'utils';

import VestingContractCard from '../Cards/VestingContractCard';
import CreateVestingContractModal from '../CreateVestingContractModal';
import ContractsProfile from './VestingContractsProfile';

export default function VestingContracts() {
  const { vestingContracts, vestings: allVestings } = useDashboardContext();
  const { mintFormState: token } = useTokenContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});

  const router = useRouter();

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(vestingContracts, allVestings);

  const getVestingInfoByContract = useCallback(
    (contract: string) => {
      const vestings = vestingSchedulesInfo.filter((vi) => compareAddresses(vi.address, contract));
      let allocation = 0,
        unclaimed = 0,
        withdrawn = 0,
        locked = 0;
      vestings.forEach((vesting) => {
        allocation += Number(vesting.allocation);
        unclaimed += Number(vesting.unclaimed);
        withdrawn += Number(vesting.withdrawn);
        locked += Number(vesting.locked);
      });
      const vestingContract = vestingContracts.find((item) => compareAddresses(item.data.address, contract));
      return {
        address: contract,
        recipient: '',
        allocation: allocation.toString(),
        unclaimed: unclaimed.toString(),
        withdrawn: withdrawn.toString(),
        locked: locked.toString(),
        reserved: (
          Number(ethers.utils.formatEther(vestingContract?.data.balance || '0')) -
          withdrawn +
          unclaimed
        ).toString()
      };
    },
    [vestingSchedulesInfo]
  );

  const vestingContractsInfo = useMemo(() => {
    return vestingContracts.map((vestingContract) => getVestingInfoByContract(vestingContract.data.address));
  }, [vestingSchedulesInfo, getVestingInfoByContract, vestingContracts]);

  return (
    <div className="w-full">
      <div className="mb-9">
        <div className="flex justify-between">
          <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
            Contracts
          </Typography>
          <button className="primary row-center" onClick={showModal}>
            <PlusIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Create</span>
          </button>
        </div>

        <div className="flex items-center mt-2">
          <Image src={String(token?.logo) || '/icons/ethereum.svg'} alt="token-image" width={18} height={18} />
          <Typography size="base" variant="inter" className=" font-medium text-neutral-900 ml-2 mr-9">
            {token.name}
          </Typography>
          <Copy text={token?.address || ''}>
            <p className="paragraphy-small ">
              {token.address.slice(0, 5)}...{token.address.slice(-4)}
            </p>
          </Copy>
        </div>
      </div>

      <ContractsProfile vestingContractsInfo={vestingContractsInfo} vestingCount={vestingContracts.length} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 px-6">
        {!vestingContracts
          ? Array.from(new Array(3)).map((_, index) => (
              <div key={index} className="animate-pulse w-full">
                <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
              </div>
            ))
          : vestingContracts.map((vestingContractInfo) => {
              const vestingInfo = getVestingInfoByContract(String(vestingContractInfo?.data.address));
              return (
                <VestingContractCard
                  key={vestingContractInfo.data.address}
                  title={String(vestingContractInfo.data.name)}
                  address={vestingContractInfo.data.address}
                  totalAllocation={vestingInfo?.allocation || ''}
                  withdrawnAmount={Number(String(vestingInfo?.withdrawn)).toFixed(2)}
                  unclaimedAmount={Number(String(vestingInfo?.unclaimed)).toFixed(2)}
                  totalLockedAmount={Number(String(vestingInfo?.locked)).toFixed(2)}
                  buttonLabel="View contract"
                  buttonAction={() => router.push(`/contracts/${vestingContractInfo.id}`)}
                />
              );
            })}

        <div
          className={`w-full border border-primary-50 rounded-10 p-6 font-medium flex justify-center items-center min-h-[272px]`}>
          <div className="flex flex-col items-center gap-3">
            <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />
            <Typography size="subtitle" variant="inter" className=" font-bold text-neutral-800 ">
              New Contract
            </Typography>
            <button
              type="button"
              className="px-5 bg-secondary-900 border border-secondary-900 rounded-8 p-1"
              onClick={showModal}>
              <Typography className="text-center text-white font-medium" size="base">
                Create
              </Typography>
            </button>
          </div>
        </div>
      </div>
      <ModalWrapper>
        <CreateVestingContractModal hideModal={hideModal} />
      </ModalWrapper>
    </div>
  );
}
