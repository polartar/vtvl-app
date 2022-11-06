import Chip from '@components/atoms/Chip/Chip';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useWeb3React } from '@web3-react/core';
import add from 'date-fns/add';
import format from 'date-fns/format';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { INITIAL_VESTING_FORM_STATE, IScheduleFormState, useVestingContext } from 'providers/vesting.context';
import { ReactElement, forwardRef, useEffect, useState } from 'react';
import Datepicker from 'react-datepicker';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActionMeta, OnChangeValue, SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { fetchContractByQuery } from 'services/db/contract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { SelectOptions } from 'types/shared';

type DateTimeType = Date | null;

interface ScheduleFormTypes {
  startDateTime: DateTimeType;
  endDateTime: DateTimeType;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
}

interface TemplateOptionTypes {
  label: string | number;
  value: string | number;
}

interface TemplateType {
  template: SingleValue<TemplateOptionTypes>;
}

const ConfigureSchedule: NextPageWithLayout = () => {
  const { account } = useWeb3React();
  const { scheduleFormState, updateScheduleFormState } = useVestingContext();
  // Use form to initially assign default values
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    formState: { errors, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: scheduleFormState
  });

  // Set the default values for the template form
  const defaultTemplateValue: TemplateType = { template: { label: '', value: '' } };

  // Use for to initially assign default values
  const { control: control2, setValue: setValue2 } = useForm({
    defaultValues: defaultTemplateValue
  });

  // Handle the submit of the form
  const onSubmit: SubmitHandler<IScheduleFormState> = (data) => {
    console.log('Form Submitted', data, getValues());
    updateScheduleFormState({ ...scheduleFormState, ...data });
    Router.push('/vesting-schedule/add-beneficiary');
  };

  // Form fields
  const startDateTime = { value: watch('startDateTime'), state: getFieldState('startDateTime') };
  const endDateTime = { value: watch('endDateTime'), state: getFieldState('endDateTime') };
  const cliffDuration = { value: watch('cliffDuration'), state: getFieldState('cliffDuration') };
  const releaseFrequency = { value: watch('releaseFrequency'), state: getFieldState('releaseFrequency') };
  const amountToBeVested = { value: watch('amountToBeVested'), state: getFieldState('amountToBeVested') };

  // Supporting variables
  const tokenSupply = 100000;

  const cliffOptions = [
    { label: 'No cliff', value: 'no-cliff' },
    { label: '1 hour', value: '1-hour' },
    { label: '6 hours', value: '6-hours' },
    { label: '12 hours', value: '12-hours' },
    { label: '1 day', value: '1-day' },
    { label: '5 days', value: '5-days' },
    { label: '2 weeks', value: '2-weeks' },
    { label: '1 month', value: '1-month' },
    { label: '3 months', value: '3-months' },
    { label: '6 months', value: '6-months' },
    { label: '1 year', value: '1-year' }
  ];

  const radioOptions = [
    { label: 'Continuous', value: 'continuous' },
    { label: 'Minute', value: 'minute' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  // Handle the changes made when updating the amount to be vested.
  const handleMinChange = (e: any) => {
    console.log('Min changed', +e.target.value, tokenSupply);
    setValue('amountToBeVested', e.target.value);
  };

  // Handle the changes for the date pickers.
  const handleDateTimeChange = (date: DateTimeType, field: 'startDateTime' | 'endDateTime') => {
    setValue(field, date);
    if (field === 'endDateTime') {
      setShowDateCalendar(false);
      setShowTimePicker(false);
    }
  };

  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleFocusCalendar = () => {
    setShowDateCalendar(true);
  };

  const handleFocusTimePicker = () => {
    setShowTimePicker(true);
  };

  // Handlers for the template input
  // Create function that returns an object for the options list -- lowercased and no spaces.
  const createTemplate = (label: string) => ({ label, value: label.toLocaleLowerCase().replace(/W/g, '') });
  // Sets the initial default recipient options -- will probably need to adjust this later on.
  // Should base from data fetched from firestore
  const templateDefaultOptions: SelectOptions[] = [];

  const [templateOptions, setTemplateOptions] = useState(templateDefaultOptions);

  /**
   * From https://react-select.com/creatable
   * Handle the onChange event of the recipient type -- when the user selects from the options.
   * We set the form value here.
   * @param newValue
   * @param actionMeta
   */
  const onTemplateChange = (
    newValue: OnChangeValue<TemplateOptionTypes, false>,
    actionMeta: ActionMeta<TemplateOptionTypes>
  ) => {
    console.group('Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
    setValue2('template', newValue);
  };

  /**
   * From react-select
   * Handles the onCreateOption event of the recipient type -- when the user tries to select own value.
   * Automatically lowercase and remove spaces for the value key.
   * To do: Save the newly added option to the database -- for all the recipient types data
   * @param inputValue
   */
  const onCreateTemplate = (inputValue: string) => {
    const newOptions = createTemplate(inputValue);
    setTemplateOptions([...templateOptions, newOptions]);
    setValue2('template', newOptions);
  };

  console.log('Schedule Configuration', watch());

  // useEffect(() => {
  //   if (account) {
  //     fetchContractByQuery('owner', '==', account).then((res) => {
  //       updateScheduleFormState((scheduleFormState: IScheduleFormState) => ({
  //         ...scheduleFormState,
  //         token: res?.address
  //       }));
  //     });
  //   }
  // }, [account]);
  console.log({ scheduleFormState });

  const quickDates = [
    { label: '+ 1 month', value: '1-month' },
    { label: '+ 3 months', value: '3-months' },
    { label: '+ 6 months', value: '6-months' },
    { label: '+ 1 year', value: '1-year' },
    { label: '+ 2 years', value: '2-years' },
    { label: '+ 4 years', value: '4-years' }
  ];

  /**
   * Quick way for the user to fill up the END DATE and TIME
   * Clicking a chip duration ie., +1 month, +1 year etc. will automatically add that into the START DATE TIME to set the END DATE TIME
   */
  const addDateToSchedule = (value: string) => {
    const durationOption = {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0
    };
    switch (value) {
      case '1-month':
        durationOption.months = 1;
        break;
      case '3-months':
        durationOption.months = 3;
        break;
      case '6-months':
        durationOption.months = 6;
        break;
      case '1-year':
        durationOption.years = 1;
        break;
      case '2-years':
        durationOption.years = 2;
        break;
      case '4-years':
        durationOption.years = 4;
        break;
    }

    // Get the start date and add the corresponding new date
    if (startDateTime.value) {
      const prospectiveEndDateTime = add(startDateTime.value, durationOption);
      setValue('endDateTime', prospectiveEndDateTime);
    } else {
      // If no start date is currently selected, use the current date
      const prospectiveStartDateTime = new Date();
      const prospectiveEndDateTime = add(prospectiveStartDateTime, durationOption);
      setValue('startDateTime', prospectiveStartDateTime);
      setValue('endDateTime', prospectiveEndDateTime);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-12 w-full gap-3.5">
        <div className="md:col-span-7">
          <Form isSubmitting={isSubmitting} className="w-full mb-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              {/**
               * Date picker start
               * Shows a custom input and the date picker itself
               * */}
              <div>
                {startDateTime.value ? (
                  <>
                    <Input
                      label="Start date"
                      required
                      value={format(startDateTime.value, 'MM/dd/yyyy')}
                      onFocus={handleFocusCalendar}
                    />
                    {showDateCalendar ? (
                      <div className="mt-5">
                        <Datepicker
                          selected={getValues('startDateTime')}
                          onChange={(date) => handleDateTimeChange(date, 'startDateTime')}
                          selectsStart
                          startDate={getValues('startDateTime')}
                          endDate={getValues('endDateTime')}
                          inline
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
              <div>
                {endDateTime.value ? (
                  <>
                    <Input
                      label="End date"
                      required
                      value={format(endDateTime.value, 'MM/dd/yyyy')}
                      onFocus={handleFocusCalendar}
                    />
                    {showDateCalendar ? (
                      <div className="mt-5">
                        <Datepicker
                          selected={getValues('endDateTime')}
                          onChange={(date) => handleDateTimeChange(date, 'endDateTime')}
                          selectsEnd
                          startDate={getValues('startDateTime')}
                          endDate={getValues('endDateTime')}
                          minDate={getValues('startDateTime')}
                          inline
                          className="mt-5"
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
              {/* Date picker end */}
              <div className="md:col-span-2 row-center gap-3">
                <div className="row-center flex-wrap">
                  {quickDates.map((quickDate, qdIndex) => (
                    <Chip
                      key={`Quick-date-${qdIndex}`}
                      label={quickDate.label}
                      rounded
                      color="alt"
                      className="cursor-pointer transform transition-all hover:-translate-y-px hover:bg-primary-900 hover:text-neutral-50 hover:border-primary-900"
                      onClick={() => addDateToSchedule(quickDate.value)}
                    />
                  ))}
                </div>
              </div>

              {/**
               * Time picker start
               * Same behavior as the date picker
               * */}
              <div>
                {startDateTime.value ? (
                  <Input
                    label="Start time"
                    required
                    value={format(startDateTime.value, 'h:mm aa')}
                    onFocus={handleFocusTimePicker}
                  />
                ) : null}
                {showTimePicker ? (
                  <div className="mt-5">
                    <Datepicker
                      selected={getValues('startDateTime')}
                      onChange={(date) => handleDateTimeChange(date, 'startDateTime')}
                      selectsStart
                      startDate={getValues('startDateTime')}
                      endDate={getValues('endDateTime')}
                      inline
                      showTimeSelect
                      showTimeSelectOnly
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      timeIntervals={15}
                    />
                  </div>
                ) : null}
              </div>
              <div>
                {endDateTime.value ? (
                  <Input
                    label="End time"
                    required
                    value={format(endDateTime.value, 'h:mm aa')}
                    onFocus={handleFocusTimePicker}
                  />
                ) : null}
                {showTimePicker ? (
                  <div className="mt-5">
                    <Datepicker
                      selected={getValues('endDateTime')}
                      onChange={(date) => handleDateTimeChange(date, 'endDateTime')}
                      selectsEnd
                      startDate={getValues('startDateTime')}
                      endDate={getValues('endDateTime')}
                      minDate={getValues('startDateTime')}
                      inline
                      showTimeSelect
                      showTimeSelectOnly
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      timeIntervals={15}
                    />
                  </div>
                ) : null}
              </div>
              {/* Time picker end */}
              <div className="md:col-span-2 border-b border-neutral-300 pb-5">
                <Controller
                  name="cliffDuration"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInput
                      label="Cliff duration"
                      placeholder="Select how many"
                      options={cliffOptions}
                      required
                      error={Boolean(errors.cliffDuration)}
                      message={errors.cliffDuration ? 'Please select cliff duration' : ''}
                      {...field}
                    />
                  )}
                />
                {cliffDuration.value === 'no-cliff' ? null : (
                  <Controller
                    name="lumpSumReleaseAfterCliff"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState, formState }) => (
                      <Input
                        label="Lumpsum release after cliff (%) (0-99)"
                        placeholder="Enter lumpsum amount"
                        className="mt-5"
                        required
                        error={Boolean(fieldState.error)}
                        message={fieldState.error ? 'Please enter lump sum amount' : ''}
                        {...field}
                      />
                    )}
                  />
                )}
              </div>
              <div className="md:col-span-2 border-b border-neutral-300 pb-5">
                <Controller
                  name="releaseFrequency"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <BarRadio
                      label="Release frequency"
                      options={radioOptions}
                      required
                      error={Boolean(errors.releaseFrequency)}
                      message={errors.releaseFrequency ? 'Please select cliff duration' : ''}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2 pb-5">
                <LimitedSupply
                  label="Amount to be vested"
                  required
                  initial={amountToBeVested.value}
                  maximum={tokenSupply}
                  onMinChange={handleMinChange}
                  onUseMax={() => setValue('amountToBeVested', tokenSupply)}
                  maxReadOnly
                />
              </div>
            </div>
            <div className="flex flex-row justify-end items-center border-t border-neutral-200 pt-5">
              <button className="primary" type="submit">
                Continue
              </button>
            </div>
          </Form>
        </div>
        <div className="md:col-span-5">
          <div className="panel">
            <div className="border-b border-neutral-200 pb-5 mb-5">
              {/*
               * In this form control, we should be able to do the following:
               * 1. List of options should come from DB. The data should contain the name of the template, and its form values.
               * 2. Selecting a template option will automatically update all form fields above (defaultValues) based on the template's form values.
               * 3. Creating a new template from this input should save the name and all current form field values to the DB.
               * Possible Validations:
               * 1. Creating a template with incomplete form above should not be allowed.
               * 2. If there is a value in the form above, when the user selects a new template it should prompt for unsaved changes (and will override the current values above if the user accepts).
               */}
              <Controller
                name="template"
                control={control2}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <label className="required md:col-span-2">
                    <span>Vesting template</span>
                    <CreatableSelect
                      onCreateOption={onCreateTemplate}
                      options={templateOptions}
                      {...field}
                      value={field.value}
                      onChange={onTemplateChange}
                      placeholder="Find or create template"
                      noOptionsMessage={() => 'Type to create a template'}
                      className="select-container"
                      classNamePrefix="select"
                    />
                    {fieldState.error ? (
                      <div className="text-danger-500 text-xs mt-1 mb-3">Please select or enter a recipient</div>
                    ) : null}
                  </label>
                )}
              />
            </div>
            <ScheduleDetails {...getValues()} token="BICO" layout="small" />
          </div>
        </div>
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ConfigureSchedule.getLayout = function getLayout(page: ReactElement) {
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
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={0}>
      {page}
    </SteppedLayout>
  );
};

export default ConfigureSchedule;
