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
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getDuration,
  getNumberOfReleases,
  getProjectedEndDateTime,
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
  const { organizationId, safe } = useAuthContext();
  const { recipients, scheduleFormState, resetVestingState } = useVestingContext();
  const { mintFormState } = useTokenContext();

  const handleCreateSchedule = async () => {
    const PERFORM_CREATE_FUNCTION = 'function performCreate(uint256 value, bytes memory deploymentData)';
    const PERFORM_CREATE_INTERFACE = 'performCreate(uint256,bytes)';
    const ABI = [PERFORM_CREATE_FUNCTION];
    const vestingId = await createVesting({
      details: scheduleFormState,
      recipients,
      organizationId: organizationId!,
      status: 'WAITING_APPROVAL',
      createdAt: Math.floor(new Date().getTime() / 1000),
      updatedAt: Math.floor(new Date().getTime() / 1000),
      transactionId: ''
    });
    resetVestingState();
    Router.push('/vesting-schedule/success');
    // try {
    //   if (!library) {
    //     activate(injected);
    //   } else if (account && safe && chainId) {
    //     if (safe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
    //       const performCreateInterface = new ethers.utils.Interface(ABI);
    //       const vestingContractInterface = new ethers.utils.Interface(VtvlVesting.abi);
    //       console.log('0x' + VtvlVesting.bytecode + vestingContractInterface.encodeDeploy([mintFormState.address]));
    //       const performCreateEncoded = performCreateInterface.encodeFunctionData(PERFORM_CREATE_INTERFACE, [
    //         '0',
    //         '0x' + VtvlVesting.bytecode + vestingContractInterface.encodeDeploy([mintFormState.address]).slice(2)
    //       ]);

    //       const deployTxData = {
    //         to: '0x7cbb62eaa69f79e6873cd1ecb2392971036cfaa4',
    //         data: performCreateEncoded,
    //         value: '0'
    //       };
    //       // console.log({ deployTxData });
    //       const ethAdapter = new EthersAdapter({
    //         ethers: ethers,
    //         signer: library?.getSigner(0)
    //       });
    //       const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
    //       const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: deployTxData });
    //       const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction);
    //       const txHash = await safeSdk.getTransactionHash(safeTransaction);
    //       console.log({ safeTransaction, signedSafeTransaction, txHash });

    //       // const ethAdapterOwner2 = new EthersAdapter({ ethers, signer: library?.getSigner(0) });
    //       // const safeSdk2 = await safeSdk.connect({ ethAdapter: ethAdapterOwner2, safeAddress: safe?.address });
    //       // const safeService = new SafeServiceClient({
    //       //   txServiceUrl: SupportedChains[chainId].multisigTxUrl,
    //       //   ethAdapter
    //       // });
    //       // const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
    //       //   '0xfc5818c84be0ca998661e0502472a78ceee613af37589482539dfb22a0010eee'
    //       // );
    //       // const safeTx = await safeSdk2.createTransaction({
    //       //   safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
    //       // });
    //       // apiTx.confirmations?.forEach((confirmation) => {
    //       //   safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
    //       // });
    //       // const approveTxResponse = await safeSdk2.executeTransaction(safeTx);
    //       // await approveTxResponse.transactionResponse?.wait();
    //     }

    //     // const ethAdapterOwner2 = new EthersAdapter({ ethers, signer: library?.getSigner(1) });
    //     // const safeSdk2 = await safeSdk.connect({ ethAdapter: ethAdapterOwner2, safeAddress: safe?.address });
    //     // const txHash = await safeSdk2.getTransactionHash(safeTransaction);
    //     // const approveTxResponse = await safeSdk2.approveTransactionHash(txHash);
    //     // await approveTxResponse.transactionResponse?.wait();

    //     // const userContracts = await fetchContractByQuery('owner', '==', account);
    //     // const tokenContract = new ethers.Contract(
    //     //   scheduleFormState.token,
    //     //   [
    //     //     // Read-Only Functions
    //     //     'function balanceOf(address owner) view returns (uint256)',
    //     //     'function decimals() view returns (uint8)',
    //     //     'function symbol() view returns (string)',
    //     //     // Authenticated Functions
    //     //     'function transfer(address to, uint amount) returns (bool)',
    //     //     // Events
    //     //     'event Transfer(address indexed from, address indexed to, uint amount)'
    //     //   ],
    //     //   library.getSigner()
    //     // );
    //     // const VestingFactory = new ethers.ContractFactory(VtvlVesting.abi, VtvlVesting.bytecode, library.getSigner());
    //     // let vestingContractAddress = '';
    //     // let vestingContract;
    //     // if (userContracts?.data?.vestingContract) {
    //     //   vestingContractAddress = userContracts?.data?.vestingContract;
    //     //   vestingContract = new ethers.Contract(vestingContractAddress, VtvlVesting.abi, library.getSigner());
    //     // } else {
    //     //   vestingContract = await VestingFactory.deploy(scheduleFormState.token);
    //     //   await vestingContract.deployed();
    //     //   vestingContractAddress = vestingContract.address;
    //     //   if (userContracts?.id && userContracts.data) {
    //     //     updateContract({ ...userContracts.data, vestingContract: vestingContractAddress }, userContracts?.id);
    //     //   }
    //     // }
    //     // const tokenBalance = await tokenContract.balanceOf(vestingContractAddress);
    //     // if (BigNumber.from(tokenBalance).lt(BigNumber.from(parseTokenAmount(scheduleFormState.amountToBeVested)))) {
    //     //   const tx = await tokenContract.transfer(
    //     //     vestingContractAddress,
    //     //     BigNumber.from(parseTokenAmount(scheduleFormState.amountToBeVested)).sub(BigNumber.from(tokenBalance))
    //     //   );
    //     //   await tx.wait();
    //     // }
    //     // const cliffAmountPerUser =
    //     //   getCliffAmount(
    //     //     scheduleFormState.cliffDuration,
    //     //     +scheduleFormState.lumpSumReleaseAfterCliff,
    //     //     +scheduleFormState.amountToBeVested
    //     //   ) / recipients.length;
    //     // const vestingAmountPerUser = +scheduleFormState.amountToBeVested / recipients.length - cliffAmountPerUser;
    //     // const addresses = recipients.map((recipient) => recipient.walletAddress);
    //     // const cliffReleaseDate = scheduleFormState.startDateTime
    //     //   ? getCliffDateTime(scheduleFormState.startDateTime, scheduleFormState.cliffDuration)
    //     //   : '';
    //     // const cliffReleaseTimestamp = cliffReleaseDate ? Math.floor(cliffReleaseDate.getTime() / 1000) : 0;
    //     // const numberOfReleases =
    //     //   scheduleFormState.startDateTime && scheduleFormState.endDateTime
    //     //     ? getNumberOfReleases(
    //     //         scheduleFormState.releaseFrequency,
    //     //         cliffReleaseDate || scheduleFormState.startDateTime,
    //     //         scheduleFormState.endDateTime
    //     //       )
    //     //     : 0;
    //     // const actualStartDateTime =
    //     //   scheduleFormState.cliffDuration !== 'no-cliff' ? cliffReleaseDate : scheduleFormState.startDateTime;
    //     // const vestingEndTimestamp =
    //     //   scheduleFormState.endDateTime && actualStartDateTime
    //     //     ? getProjectedEndDateTime(
    //     //         actualStartDateTime,
    //     //         scheduleFormState.endDateTime,
    //     //         numberOfReleases,
    //     //         DATE_FREQ_TO_TIMESTAMP[scheduleFormState.releaseFrequency]
    //     //       )
    //     //     : null;
    //     // const vestingStartTimestamps = new Array(recipients.length).fill(
    //     //   cliffReleaseTimestamp ? cliffReleaseTimestamp : Math.floor(scheduleFormState.startDateTime!.getTime() / 1000)
    //     // );
    //     // const vestingEndTimestamps = new Array(recipients.length).fill(
    //     //   Math.floor(vestingEndTimestamp!.getTime() / 1000)
    //     // );
    //     // const vestingCliffTimestamps = new Array(recipients.length).fill(cliffReleaseTimestamp);
    //     // const vestingReleaseIntervals = new Array(recipients.length).fill(
    //     //   DATE_FREQ_TO_TIMESTAMP[scheduleFormState.releaseFrequency]
    //     // );
    //     // const vestingLinearVestAmounts = new Array(recipients.length).fill(parseTokenAmount(vestingAmountPerUser, 18));
    //     // const vestingCliffAmounts = new Array(recipients.length).fill(parseTokenAmount(cliffAmountPerUser, 18));
    //     // console.log({
    //     //   addresses,
    //     //   vestingStartTimestamps,
    //     //   vestingEndTimestamps,
    //     //   vestingCliffTimestamps,
    //     //   vestingReleaseIntervals,
    //     //   vestingLinearVestAmounts,
    //     //   vestingCliffAmounts
    //     // });
    //     // await vestingContract.createClaimsBatch(
    //     //   addresses,
    //     //   vestingStartTimestamps,
    //     //   vestingEndTimestamps,
    //     //   vestingCliffTimestamps,
    //     //   vestingReleaseIntervals,
    //     //   vestingLinearVestAmounts,
    //     //   vestingCliffAmounts
    //     // );
    //     // // updateMintFormState({ ...mintFormState, contractAddress: vestingContract.address });
    //     // // const tokensCollection = collection(db, 'tokens');
    //     // // addDoc(tokensCollection, {
    //     // //   address: vestingContract.address,
    //     // //   owner: account,
    //     // //   logo: tokenLogo
    //     // // });
    //     // console.log('Deployed an ERC Token for testing.');
    //     // console.log('Address:', vestingContract.address);
    //   }
    // } catch (err) {
    //   console.log('err - ', err);
    // }
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
              BICO
            </p>
          </label>
          <label>
            <span>Total locked tokens</span>
            <p>{formatNumber(new Decimal(scheduleFormState.amountToBeVested).toDP(6, Decimal.ROUND_UP))} BICO</p>
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
