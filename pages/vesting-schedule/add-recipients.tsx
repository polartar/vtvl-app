import BackButton from '@components/atoms/BackButton/BackButton';
import CreateLabel from '@components/atoms/CreateLabel/CreateLabel';
import Input from '@components/atoms/FormControls/Input/Input';
import ImportCSVFlow from '@components/organisms/Forms/ImportCSVFlow';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import Decimal from 'decimal.js';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useDashboardContext } from 'providers/dashboard.context';
import { ReactElement, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Modal, { Styles } from 'react-modal';
import Select, { ActionMeta, MultiValue, OnChangeValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { IRecipient, IRecipientFormState, IRecipientType } from 'types/vesting';
import { convertLabelToOption } from 'utils/shared';
import { formatNumber } from 'utils/token';

const AddBeneficiary: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();
  // Get to use the react-hook-form and set default values
  // This is for the dynamic changing of the recipient detail forms
  const defaultRecipientValues: IRecipient = {
    walletAddress: '',
    name: '',
    company: '',
    recipientType: []
  };
  const { recipients: recipientsData, updateRecipients, scheduleFormState } = useVestingContext();
  const { vestings, recipients: organizationRecipients } = useDashboardContext();

  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    setValue,
    reset,
    formState: { errors, isSubmitted }
  } = useForm({
    defaultValues: defaultRecipientValues
  });

  // Handles the 2nd level form -- where the list of the recipients are placed.
  const {
    control: beneficiariesControl,
    handleSubmit: beneficiariesSubmit,
    watch: recipientsWatch,
    getFieldState: recipientsGetFieldState,
    setValue: recipientsSetValue,
    clearErrors: recipientClearErrors,
    formState: { errors: beneficiariesErrors }
  } = useForm({
    defaultValues: {
      recipients: recipientsData
    }
  });

  // Level 1 Form fields
  const walletAddress = { value: watch('walletAddress'), state: getFieldState('walletAddress') };
  const name = { value: watch('name'), state: getFieldState('name') };
  const company = { value: watch('company'), state: getFieldState('company') };
  const recipientType = { value: watch('recipientType'), state: getFieldState('recipientType') };

  // Beneficiary type dropdown auto-complete
  /**
   * From https://react-select.com/creatable
   * Handle the onChange event of the beneficiary type -- when the user selects from the options.
   * We set the form value here.
   * @param newValue
   * @param actionMeta
   */
  const onRecipientTypeChange = (
    newValue: OnChangeValue<IRecipientType, true>,
    actionMeta: ActionMeta<IRecipientType>
  ) => {
    console.group('Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
    setValue('recipientType', newValue);
  };

  /**
   * From react-select
   * Handles the onCreateOption event of the beneficiary type -- when the user tries to select own value.
   * Automatically lowercase and remove spaces for the value key.
   * To do: Save the newly added option to the database -- for all the beneficiary types data
   * @param inputValue
   */
  const onCreateRecipientType = (inputValue: string) => {
    const newOptions = convertLabelToOption(inputValue);
    setRecipientTypeOptions([...beneficiaryTypeOptions, newOptions]);
    setValue('recipientType', [...recipientType.value, newOptions]);
  };

  // Sets the initial default beneficiary options -- will probably need to adjust this later on.
  // Should base from data fetched from firestore
  const beneficiaryTypeDefaultOptions = [
    convertLabelToOption('Founder'),
    convertLabelToOption('Investor'),
    convertLabelToOption('Employee'),
    convertLabelToOption('Advisor'),
    convertLabelToOption('Community'),
    convertLabelToOption('Partner'),
    convertLabelToOption('Other')
  ];

  // Set the default beneficiary type options
  const [beneficiaryTypeOptions, setRecipientTypeOptions] = useState(beneficiaryTypeDefaultOptions);
  const [recipientDuplicated, setRecipientDuplicated] = useState(false);

  // Higher level recipient dropdown
  const recipients = { value: recipientsWatch('recipients'), state: recipientsGetFieldState('recipients') };
  const [recipientOptions, setRecipientOptions] = useState<MultiValue<IRecipient>>([]);

  const onChangeRecipient = (newValue: OnChangeValue<IRecipient, true>, actionMeta: ActionMeta<IRecipient>) => {
    console.group('Recipient Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
    recipientsSetValue('recipients', newValue);
    recipientClearErrors();
  };

  const addRecipient = (data: IRecipient) => {
    const labelValue = convertLabelToOption(data.name);
    const newValue = { ...data, ...labelValue };
    // Add the data to the new options list and also as value
    let allRecipients: IRecipient[] = [...recipients.value];
    if (vestings && vestings.length > 0) {
      vestings.map((vesting) => {
        allRecipients = [...allRecipients, ...vesting.data.recipients];
      });
    }

    if (
      allRecipients.find((recipient) => recipient.walletAddress.toLowerCase() === newValue.walletAddress.toLowerCase())
    ) {
      setRecipientDuplicated(true);
      return;
    }

    setRecipientDuplicated(false);
    const newRecipients = [...recipients.value, newValue];
    recipientsSetValue('recipients', [...newRecipients]);
    setRecipientOptions([...newRecipients]);

    console.log('Form Submitted');
    setTimeout(() => {
      reset();
    }, 500);
  };

  /**
   * Handles the submit form when using the "Add beneficiary" button.
   * This should add the particular beneficiary into the list options of the beneficiary autocomplete input.
   * @param data
   */
  const onSubmit: SubmitHandler<IRecipient> = (data) => {
    addRecipient(data);
    recipientClearErrors();
  };

  /**
   * Handles the overall submit of form when hitting the "Continue" button.
   * This should have the recipients record selected from the createableselect component.
   */
  const onRecipientsSubmit: SubmitHandler<IRecipientFormState> = (data) => {
    console.log('Recipient is now submitted', data);
    updateRecipients([...data.recipients]);
    Router.push('/vesting-schedule/configure');
  };

  /**
   * Handles the modal step process
   */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [templateUrl, setTemplateUrl] = useState('');

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

  const beneficiaryFields = [
    { label: 'Wallet Address', value: 'walletAddress' },
    { label: 'Beneficiary', value: 'recipientType' },
    { label: 'Name', value: 'name' },
    { label: 'Company Name', value: 'company' }
  ];

  const csvMappingSteps = {
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
  };

  /**
   * Handle the completion of Importing a CSV file
   * @params data - data from the onComplete of ImportCSVFlow component
   */
  const handleCSVImport = (fileData: any) => {
    const { data } = fileData;
    console.log('Here is the data!!!!', data);
    // We just need to map this out and turn it into the list of recipients.
    const newData = data.map((record: any) => {
      // Hard coding recipientType
      const labelValue = convertLabelToOption(record.name);
      console.log('Each data', record);
      return {
        ...record,
        ...labelValue,
        recipientType: [convertLabelToOption(record.recipientType)]
      };
    });

    const newRecipients = [...recipients.value, ...newData];
    recipientsSetValue('recipients', [...newRecipients]);
    setRecipientOptions([...newRecipients]);
    console.log('New Data', newRecipients);
    setModalOpen(false);
  };

  // Get download url
  useEffect(() => {
    const storage = getStorage();
    const pathReference = ref(storage, 'templates/sample-add-recipient.csv');
    getDownloadURL(pathReference).then((url) => {
      setTemplateUrl(url);
    });
  }, []);

  useEffect(() => {
    setRecipientDuplicated(false);
  }, [walletAddress.value]);

  useEffect(() => {
    if (organizationRecipients) {
      setRecipientOptions(organizationRecipients);
      // recipientsSetValue('recipients', organizationRecipients);
    }
  }, [organizationRecipients]);

  return (
    <>
      <div className="w-full mb-6 panel max-w-2xl">
        <Controller
          name="recipients"
          control={beneficiariesControl}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <label className="required">
                <div className="flex flex-row items-center justify-between gap-3">
                  <span className="form-label required">Select recipient</span>
                  <p className="text-xs font-medium text-neutral-700">
                    Token allocation per user:{' '}
                    {recipients.value && recipients.value.length > 0
                      ? formatNumber(
                          new Decimal(scheduleFormState.amountToBeVested)
                            .div(new Decimal(recipients.value.length))
                            .toDP(6, Decimal.ROUND_UP)
                        )
                      : 0}{' '}
                    <strong>{mintFormState.symbol || 'Token'}</strong>
                  </p>
                </div>
                <Select
                  isMulti
                  options={recipientOptions}
                  {...field}
                  value={recipients.value}
                  onChange={onChangeRecipient}
                  noOptionsMessage={() => <>Create a recipient below</>}
                  className="select-container"
                  classNamePrefix="select"
                  placeholder="Add recipient below"
                />
                {beneficiariesErrors.recipients ? (
                  <p className="text-danger-500 text-xs mt-1 mb-3">Please select or enter a beneficiary</p>
                ) : null}
              </label>
            </>
          )}
        />
        <form
          className="grid md:grid-cols-2 gap-5 border-b border-t py-5 border-neutral-300 my-5"
          onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="walletAddress"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Wallet address"
                placeholder="Enter wallet address"
                className="md:col-span-2"
                required
                error={Boolean(errors.walletAddress) || recipientDuplicated}
                message={
                  errors.walletAddress
                    ? 'Please enter wallet address'
                    : recipientDuplicated
                    ? 'Wallet address is duplicated'
                    : ''
                }
                {...field}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                label="Name"
                placeholder="Enter name (optional)"
                error={Boolean(errors.name)}
                message={errors.name ? 'Please enter name' : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="company"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                label="Company name"
                placeholder="Enter company name"
                required
                error={Boolean(errors.company)}
                message={errors.company ? 'Please enter your company name' : ''}
                {...field}
              />
            )}
          />

          <Controller
            name="recipientType"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <label className="required md:col-span-2">
                <span>Recipient type</span>
                <CreatableSelect
                  isMulti
                  allowCreateWhileLoading
                  formatCreateLabel={(inputValue: string) => <CreateLabel inputValue={inputValue} />}
                  onCreateOption={onCreateRecipientType}
                  options={beneficiaryTypeOptions}
                  {...field}
                  value={recipientType.value}
                  onChange={onRecipientTypeChange}
                  className="select-container"
                  classNamePrefix="select"
                  placeholder="Find or create recipient type"
                />
                {errors.recipientType ? (
                  <div className="text-danger-500 text-xs mt-1 mb-3">Please select or enter a beneficiary type</div>
                ) : null}
              </label>
            )}
          />
          <div className="flex flex-row gap-2 md:col-span-2">
            <button type="submit" className="secondary py-1">
              Add recipient
            </button>
            <a
              href="javascript:;"
              className="flex flex-row items-center gap-3 px-5 py-2 text-base text-neutral-500"
              onClick={() => setModalOpen(true)}>
              <img src="/icons/import.svg" className="w-4 h-4" />
              Import CSV
            </a>
          </div>
        </form>
        <form
          className="flex flex-row justify-between items-center pt-5"
          onSubmit={beneficiariesSubmit(onRecipientsSubmit)}>
          <BackButton label="Back" onClick={() => Router.push('/vesting-schedule')} />
          <button className="primary" type="submit">
            Continue
          </button>
        </form>

        <Modal isOpen={modalOpen} className="z-50 max-w-lg w-full" style={styles}>
          <ImportCSVFlow
            fields={beneficiaryFields}
            steps={csvMappingSteps}
            onCancel={() => setModalOpen(false)}
            onComplete={handleCSVImport}
          />
        </Modal>
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
AddBeneficiary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/add-recipients' }
  ];

  // Update these into a state coming from the context
  const wizardSteps = [
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
  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={0}>
      {page}
    </SteppedLayout>
  );
};

export default AddBeneficiary;
