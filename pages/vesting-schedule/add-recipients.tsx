import { Typography } from '@components/atoms/Typography/Typography';
import { RecipientTable, RecipientTableRow } from '@components/molecules/RecipientTable';
import { VestingSetupPanel } from '@components/molecules/VestingSetupPanel';
import ImportCSVFlow from '@components/organisms/Forms/ImportCSVFlow';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useDashboardContext } from '@providers/dashboard.context';
import { useGlobalContext } from '@providers/global.context';
import { useVestingContext } from '@providers/vesting.context';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { useShallowState } from 'hooks/useShallowState';
import Router, { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal, { Styles } from 'react-modal';
import { IRecipient } from 'types/models';
import { WEBSITE_NAME } from 'utils/constants';
import { isEmptyArray } from 'utils/regex';

const beneficiaryFields = [
  { label: 'Name', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Wallet Address', value: 'address' },
  { label: 'Allocations', value: 'allocations' },
  { label: 'Recipient Type', value: 'type' },
  { label: 'Company Name', value: 'company' }
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

const crumbSteps = [
  { title: 'Vesting schedule', route: '/vesting-schedule' },
  { title: 'Configure schedule', route: '/vesting-schedule/add-recipients' }
];

const CreateVestingSchedule: NextPageWithLayout = () => {
  const { updateRecipients, setScheduleState, scheduleState, scheduleMode, recipients } = useVestingContext();
  const { vestings, recipients: allRecipients } = useDashboardContext();
  const {
    website: { name }
  } = useGlobalContext();
  const [rows, setRows] = useState<Array<RecipientTableRow>>([]);
  const [state, setState] = useShallowState({ step: 0 });
  const [duplicatedUsers, setDuplicatedUsers] = useState<Array<RecipientTableRow>>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  /**
   * Handles the modal step process
   */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [templateUrl, setTemplateUrl] = useState('');

  const wizardSteps = [
    {
      title: 'Schedule & contract',
      desc: 'Setup schedule and contract'
    },
    {
      title: 'Add recipients',
      desc: ''
    },
    {
      title: `${scheduleMode && scheduleMode.edit ? 'Update' : 'Create'} schedule`,
      desc: ''
    }
  ];

  const csvMappingSteps = useMemo(
    () => ({
      step1: {
        title: 'Import from CSV file',
        description: "Speed up the process by uploading a CSV file containing all your recipients' details.",
        templateLabel: `${name || WEBSITE_NAME} recipient template`,
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
        email: record.email,
        address: record.address,
        allocations: record.allocations,
        type: record.type
      }))
    );
    setModalOpen(false);
  };

  const handleReturn = useCallback(() => {
    if (state.step === 0) Router.push('/vesting-schedule');
    else {
      Router.push(
        `/vesting-schedule/add-recipients${scheduleMode && scheduleMode.edit ? '?id=' + scheduleMode.id : ''}`
      );
      setState(({ step }) => ({ step: step - 1 }));
    }
  }, [state.step]);

  const handleMoveToAddRecipientSection = useCallback(
    ({ scheduleName, contractName, createNewContract, vestingContractId }: any) => {
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
    async (data: RecipientTableRow[], newErrors: string[]) => {
      console.log({ scheduleState });
      if (scheduleState.vestingContractId) {
        const existingVestings = vestings
          .filter((vesting) => vesting.data.vestingContractId === scheduleState.vestingContractId)
          .map((vesting) => vesting.id);
        console.log({ existingVestings });
        const prevRecipients = allRecipients
          .filter((recipient) => existingVestings.includes(recipient.vestingId))
          .map((recipient) => recipient.address?.toLowerCase());
        console.log({ prevRecipients });
        console.log(scheduleMode);
        // To optimize later
        // Apply validation of this only on add form
        if (!scheduleMode.edit) {
          const res = data.filter((row: any) => row.address && prevRecipients.includes(row.address.toLowerCase()));
          setDuplicatedUsers(res);

          if (res.length > 0) {
            setErrors([...newErrors, 'Some wallet addresses are already registered in vesting contract.']);
            return;
          }
        }
      }

      setDuplicatedUsers([]);
      setErrors(newErrors);

      if (!isEmptyArray(newErrors)) {
        return;
      }

      updateRecipients?.(
        data.map((row: RecipientTableRow) => ({
          address: row.address,
          name: row.name,
          email: row.email,
          allocations: row.allocations,
          role: row.type,
          company: row.company
        })) ?? []
      );

      // Route to the next page and check if the current route is edit or add.
      Router.push(`/vesting-schedule/configure${scheduleMode && scheduleMode.edit ? '?id=' + scheduleMode.id : ''}`);
    },
    [scheduleState, rows, vestings, allRecipients, updateRecipients]
  );

  // Get download url
  useEffect(() => {
    const storage = getStorage();
    const pathReference = ref(storage, 'templates/sample-add-recipient.csv');
    getDownloadURL(pathReference).then((url) => {
      setTemplateUrl(url);
    });
  }, []);

  useEffect(() => {
    if (router.query && router.query.step && router.query.step === '1') {
      setState({ step: 1 });
    }
  }, [router.query]);

  // Get the recipients list and add it to the table on edit mode OR when navigating back here from the vesting schedule configuration form.
  useEffect(() => {
    if (
      ((scheduleMode && scheduleMode.edit) || (router.query && router.query.step && router.query.step === '1')) &&
      recipients &&
      recipients.length
    ) {
      setRows(
        recipients.map((record: IRecipient) => ({
          id: record.id,
          name: record.name,
          address: record.address,
          allocations: record.allocations,
          email: String(record.email),
          type: record.role,
          company: record.company
        }))
      );
    }
  }, [scheduleMode, recipients]);

  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={state.step}>
      {state.step === 0 && (
        <VestingSetupPanel
          initialState={scheduleState}
          onReturn={handleReturn}
          onContinue={handleMoveToAddRecipientSection}
        />
      )}

      {state.step === 1 && (
        <>
          <div className={`rounded-3xl p-[6px] ${errors.length && 'border border-danger-600 bg-danger-100'}`}>
            <div className="w-full mb-6 panel max-w-2xl bg-white">
              <div className="mb-4 flex flex-col gap-7">
                <div className="flex flex-col gap-1">
                  <Typography className="font-semibold" size="subtitle">
                    Add recipient
                  </Typography>
                  <Typography className="font-medium text-neutral-500" size="caption">
                    For all recipients without a wallet address, please ensure an{' '}
                    <Typography className="font-bold" size="caption">
                      email address
                    </Typography>{' '}
                    is provided
                  </Typography>
                </div>
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
            </div>
            {!isEmptyArray(errors) && (
              <div className="w-full flex justify-center -mt-4">
                <div className="flex flex-col gap-1">
                  {errors.map((error) => (
                    <Typography key={error} className="text-danger-700" size="caption">
                      {error}
                    </Typography>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Modal isOpen={modalOpen} className="z-50 max-w-lg w-full" style={styles}>
            <ImportCSVFlow
              fields={beneficiaryFields}
              steps={csvMappingSteps}
              onCancel={() => setModalOpen(false)}
              onComplete={handleCSVImport}
            />
          </Modal>
        </>
      )}
    </SteppedLayout>
  );
};

export default CreateVestingSchedule;
