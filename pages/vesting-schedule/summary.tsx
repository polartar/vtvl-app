import BackButton from '@components/atoms/BackButton/BackButton';
import Chip from '@components/atoms/Chip/Chip';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { Interface } from '@ethersproject/abi';
import { BaseTransaction } from '@gnosis.pm/safe-apps-sdk';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import VtvlVesting from 'contracts/abi/VtvlVesting.json';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { ReactElement } from 'react';
import { createVesting } from 'services/db/vesting';
import { createVestingContract, fetchVestingContractByQuery, updateVestingContract } from 'services/db/vestingContract';
import {
  CLIFFDURATION_TIMESTAMP,
  CliffDuration,
  DATE_FREQ_TO_TIMESTAMP,
  ReleaseFrequency
} from 'types/constants/schedule-configuration';
import { SupportedChains } from 'types/constants/supported-chains';
import { generateRandomName } from 'utils/shared';
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getDuration,
  getNumberOfReleases,
  getReleaseAmount
} from 'utils/vesting';

interface ScheduleFormTypes {
  startDateTime: Date;
  endDateTime: Date;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
}

const ScheduleSummary: NextPageWithLayout = () => {
  const { library, account, activate, chainId } = useWeb3React();
  const { organizationId, safe, user } = useAuthContext();
  const { recipients, scheduleFormState, resetVestingState } = useVestingContext();
  const { mintFormState, tokenId } = useTokenContext();

  const handleCreateSchedule = async () => {
    if (!account || !chainId) {
      activate(injected);
      return;
    }
    const PERFORM_CREATE_FUNCTION = 'function performCreate(uint256 value, bytes memory deploymentData)';
    const PERFORM_CREATE_INTERFACE = 'performCreate(uint256,bytes)';
    const ABI = [PERFORM_CREATE_FUNCTION];
    const vestingId = await createVesting({
      name: generateRandomName(4) || '',
      details: scheduleFormState,
      recipients,
      organizationId: organizationId!,
      status: 'INITIALIZED',
      createdAt: Math.floor(new Date().getTime() / 1000),
      updatedAt: Math.floor(new Date().getTime() / 1000),
      transactionId: '',
      tokenAddress: mintFormState.address,
      tokenId,
      chainId
    });
    console.log('creating vesting schedule', vestingId);
    await Router.push('/vesting-schedule/success');
    resetVestingState();
  };

  return (
    <>
      <div className="w-full mb-6 panel max-w-2xl">
        <label>
          <span>Recipient(s)</span>
        </label>
        <div className="flex flex-row flex-wrap gap-2 pb-5 border-b border-neutral-200">
          {recipients.map((recipient) => (
            <Chip rounded label={recipient.name} color="random" />
          ))}
        </div>
        <div className="py-5 border-b border-neutral-200 grid grid-cols-2 gap-3">
          <label>
            <span>Total token per recipient</span>
            <p>
              {formatNumber(
                new Decimal(scheduleFormState.amountToBeVested)
                  .div(new Decimal(recipients.length))
                  .toDP(6, Decimal.ROUND_UP)
              )}{' '}
              {mintFormState.symbol || 'Token'}
            </p>
          </label>
          <label>
            <span>Total locked tokens</span>
            <p>
              {formatNumber(new Decimal(scheduleFormState.amountToBeVested).toDP(6, Decimal.ROUND_UP))}{' '}
              {mintFormState.symbol || 'Token'}
            </p>
          </label>
        </div>
        <div className="py-5 border-b border-neutral-200">
          <ScheduleDetails {...scheduleFormState} token={mintFormState.symbol || 'Token'} />
        </div>
        <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
          <BackButton label="Return to add recipient" href="/vesting-schedule/add-beneficiary" />
          <button
            className="primary"
            type="button"
            onClick={() => {
              handleCreateSchedule();
              // Router.push('/vesting-schedule/success')
            }}>
            Create Schedule
          </button>
        </div>
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ScheduleSummary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/configure' }
  ];

  // Update these into a state coming from the context
  const wizardSteps = [
    {
      title: 'Create schedule',
      desc: 'Setup the dates and cliffs'
    },
    {
      title: 'Add beneficiary',
      desc: 'Add recipient to this schedule'
    },
    {
      title: 'Schedule summary',
      desc: ''
    }
  ];
  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={2}>
      {page}
    </SteppedLayout>
  );
};

export default ScheduleSummary;
