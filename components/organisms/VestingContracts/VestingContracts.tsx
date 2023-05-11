import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
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
  const { vestingContracts, vestings: allVestings, recipients: allRecipients } = useDashboardContext();
  const { mintFormState: token } = useTokenContext();
  const { ModalWrapper, showModal, hideModal } = useModal({});
  const router = useRouter();

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContracts,
    allVestings,
    allRecipients
  );

  const getVestingInfoByContract = useCallback(
    (contractAddress: string) => {
      const vestings = vestingSchedulesInfo.filter((vi) => compareAddresses(vi.address, contractAddress));
      let allocation = BigNumber.from(0),
        unclaimed = BigNumber.from(0),
        withdrawn = BigNumber.from(0),
        locked = BigNumber.from(0);
      vestings.forEach((vesting) => {
        allocation = allocation.add(vesting.allocation);
        unclaimed = unclaimed.add(vesting.unclaimed);
        withdrawn = withdrawn.add(vesting.withdrawn);
        locked = locked.add(vesting.locked);
      });

      const vestingContract = vestingContracts.find((contract) =>
        compareAddresses(contract.data.address, contractAddress)
      );

      return {
        address: contractAddress,
        recipient: '',
        allocation: allocation,
        unclaimed: unclaimed,
        withdrawn: withdrawn,
        locked: locked,
        reserved: vestings.length
          ? BigNumber.from(vestingContract?.data.balance || '0').sub(vestings[0].numTokensReservedForVesting || '0')
          : BigNumber.from(0)
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

      <ContractsProfile vestingContractsInfo={vestingContractsInfo} count={vestingContracts.length} title="Contract" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6">
        {!vestingContracts
          ? Array.from(new Array(3)).map((_, index) => (
              <div key={index} className="animate-pulse w-full">
                <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
              </div>
            ))
          : vestingContracts.map((vestingContractInfo, index) => {
              const vestingInfo = getVestingInfoByContract(String(vestingContractInfo?.data.address));
              return (
                <VestingContractCard
                  key={`${vestingContractInfo.data.address}_${index}`}
                  title={String(vestingContractInfo.data.name)}
                  address={vestingContractInfo.data.address}
                  totalAllocation={formatEther(vestingInfo?.allocation.toString()) || ''}
                  withdrawnAmount={Number(formatEther(String(vestingInfo?.withdrawn))).toFixed(2)}
                  unclaimedAmount={Number(formatEther(String(vestingInfo?.unclaimed))).toFixed(2)}
                  totalLockedAmount={Number(formatEther(String(vestingInfo?.locked))).toFixed(2)}
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
