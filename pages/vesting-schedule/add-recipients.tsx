import { Typography } from '@components/atoms/Typography/Typography';
import { RecipientTable, RecipientTableRow, getRecipient } from '@components/molecules/RecipientTable';
import { VestingSetupPanel } from '@components/molecules/VestingSetupPanel';
import ImportCSVFlow from '@components/organisms/Forms/ImportCSVFlow';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useVestingContext } from '@providers/vesting.context';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { useShallowState } from 'hooks/useShallowState';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal, { Styles } from 'react-modal';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { createVestingContract, fetchVestingContractsByQuery } from 'services/db/vestingContract';
import { IVesting } from 'types/models';

const beneficiaryFields = [
  { label: 'Wallet Address', value: 'address' },
  { label: 'Recipient Type', value: 'type' },
  { label: 'Name', value: 'name' },
  { label: 'Company Name', value: 'company' },
  { label: 'Allocations', value: 'allocations' }
];

const styles: Styles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: '999'
  },
  content: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
    borderRadius: '1.5rem'
  }
};

const wizardSteps = [
  {
    title: 'Schedule & contract',
    desc: 'Setup schedule and contract'
  },
  {
    title: 'Add recipient(s)',
    desc: ''
  },
  {
    title: 'Setup schedule',
    desc: ''
  },
  {
    title: 'Schedule summary',
    desc: ''
  }
];

const crumbSteps = [
  { title: 'Vesting schedule', route: '/vesting-schedule/create' },
  { title: 'Configure schedule', route: '/vesting-schedule/create' }
];

const CreateVestingSchedule: NextPageWithLayout = () => {
  const { updateRecipients, setScheduleState, scheduleState } = useVestingContext();
  const [rows, setRows] = useState<Array<RecipientTableRow>>([]);
  const [state, setState] = useShallowState({ step: 0 });
  const [duplicatedUsers, setDuplicatedUsers] = useState<Array<RecipientTableRow>>([]);

  /**
   * Handles the modal step process
   */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [templateUrl, setTemplateUrl] = useState('');

  const csvMappingSteps = useMemo(
    () => ({
      step1: {
        title: 'Import from CSV file',
        description: "Speed up the process by uploading a CSV file containing all your recipients' details.",
        templateLabel: 'VTVL recipient template',
        templateUrl: templateUrl,
        cancelButtonLabel: 'Cancel',
        confirmButtonLabel: 'Upload file'
      },
      step2: {
        title: 'Map your details',
        description: 'Match your column headers to the respective categories on the left.',
        cancelButtonLabel: 'Back',
        confirmButtonLabel: 'Continue'
      },
      step3: {
        title: 'Summary of recipients',
        description: (
          <>
            Ensure your imported data is mapped correctly. Click '<strong>Back</strong>' to edit or '
            <strong>Confirm</strong>' to review the final summary.
          </>
        ),
        cancelButtonLabel: 'Back',
        confirmButtonLabel: 'Continue'
      }
    }),
    [templateUrl]
  );

  /**
   * Handle the completion of Importing a CSV file
   * @params data - data from the onComplete of ImportCSVFlow component
   */
  const handleCSVImport = (fileData: any) => {
    const { data } = fileData;
    setRows(
      data.map((record: any, index: number) => ({
        id: String(index),
        name: record.name,
        address: record.address,
        allocations: record.allocations,
        type: record.type
      }))
    );
    setModalOpen(false);
  };

  const handleReturn = useCallback(() => {
    if (state.step === 0) Router.push('/vesting-schedule');
    else setState(({ step }) => ({ step: step - 1 }));
  }, [state.step]);

  const handleMoveToAddRecipientSection = useCallback(
    ({ scheduleName, contractName, createNewContract, vestingContractId }: any) => {
      console.log('DEBUG_vestingContract', vestingContractId);
      setScheduleState({
        name: scheduleName,
        contractName,
        createNewContract,
        vestingContractId: vestingContractId
      });
      setState(({ step }) => ({ step: step + 1 }));
    },
    [setScheduleState]
  );

  const handleContinue = useCallback(
    async (data: any[]) => {
      if (scheduleState.vestingContractId) {
        // const vestings = await fetchVestingContractsByQuery(['vestingContractId'], ['=='], [scheduleState.vestingContractId])
        const vestings: { id: string; data: IVesting }[] = await fetchVestingsByQuery(
          ['vestingContractId'],
          ['=='],
          [scheduleState.vestingContractId]
        );
        let prevRecipients: string[] = [];
        vestings.forEach((vesting) => {
          const addresses = vesting.data.recipients.map((recipient) => recipient.walletAddress.toLowerCase());
          prevRecipients = prevRecipients.concat(addresses);
        });

        const res = data.filter((row: any) => prevRecipients.includes(row.address.toLowerCase()));
        setDuplicatedUsers(res);

        if (res.length > 0) {
          return;
        }
      }

      setDuplicatedUsers([]);

      await updateRecipients?.(
        data.map((row: any) => ({
          walletAddress: row.address,
          name: row.name,
          allocations: row.allocations,
          recipientType: [getRecipient(row.type!)]
        })) ?? []
      );
      Router.push('/vesting-schedule/configure');
    },
    [scheduleState, rows, updateRecipients]
  );

  // Get download url
  useEffect(() => {
    const storage = getStorage();
    const pathReference = ref(storage, 'templates/sample-add-recipient.csv');
    getDownloadURL(pathReference).then((url) => {
      setTemplateUrl(url);
    });
  }, []);

  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={state.step}>
      {state.step === 0 && <VestingSetupPanel onReturn={handleReturn} onContinue={handleMoveToAddRecipientSection} />}
      {state.step === 1 && (
        <div className="w-full mb-6 panel max-w-2xl">
          <div className="mb-4 flex flex-col gap-7">
            <Typography className="font-semibold" size="subtitle">
              Add recipient
            </Typography>
            <a
              href="javascript:;"
              className="flex flex-row items-center gap-3 text-neutral-500"
              onClick={() => setModalOpen(true)}>
              <img src="/icons/import.svg" className="w-4 h-4" />
              <Typography size="paragraph">Import CSV</Typography>
            </a>
          </div>

          <RecipientTable initialRows={rows} onReturn={handleReturn} onContinue={handleContinue}>
            {duplicatedUsers?.length ? (
              <>
                <p className="mb-2 text-danger-500">
                  Following recipients were already added to the selected vesting contract:
                </p>
                <ul className="mb-4 pl-8 list-disc list-outside marker:text-danger-500">
                  {duplicatedUsers?.map((user) => (
                    <li key={user.address}>
                      <Typography className="text-danger-500" variant="inter" size="caption">
                        {user.name} - {user.address}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              ''
            )}
          </RecipientTable>

          <Modal isOpen={modalOpen} className="z-50 max-w-lg w-full" style={styles}>
            <ImportCSVFlow
              fields={beneficiaryFields}
              steps={csvMappingSteps}
              onCancel={() => setModalOpen(false)}
              onComplete={handleCSVImport}
            />
          </Modal>
        </div>
      )}
    </SteppedLayout>
  );
};

export default CreateVestingSchedule;
