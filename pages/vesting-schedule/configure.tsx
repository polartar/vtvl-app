import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import CreateLabel from '@components/atoms/CreateLabel/CreateLabel';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import TextField from '@mui/material/TextField';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { StaticTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import add from 'date-fns/add';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import format from 'date-fns/format';
import { Timestamp } from 'firebase/firestore';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { IScheduleFormState, useVestingContext } from 'providers/vesting.context';
import { ElementType, ReactElement, forwardRef, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActionMeta, OnChangeValue, SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import { createVestingTemplate, fetchVestingTemplatesByQuery } from 'services/db/vestingTemplate';
import {
  CLIFFDURATION_TIMESTAMP,
  CliffDuration,
  DATE_FREQ_TO_TIMESTAMP,
  ReleaseFrequency
} from 'types/constants/schedule-configuration';
import { IVestingTemplate } from 'types/models';
import { getActualDateTime } from 'utils/shared';
import { getNumberOfReleases, getProjectedEndDateTime } from 'utils/vesting';

type DateTimeType = Date | null;

interface ScheduleFormTypes {
  startDateTime: DateTimeType;
  endDateTime: DateTimeType;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
}

interface TemplateType {
  template?: SingleValue<IVestingTemplate> | undefined;
}

type CustomActionBarDateTimeField = 'startDate' | 'startTime' | 'endDate' | 'endTime';
interface CustomActionBarProps {
  field: CustomActionBarDateTimeField;
}

const ConfigureSchedule: NextPageWithLayout = () => {
  const { organizationId } = useAuthContext();
  const { account } = useWeb3React();
  const { scheduleFormState, updateScheduleFormState } = useVestingContext();
  const { mintFormState, tokenId } = useTokenContext();
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  // Use form to initially assign default values
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: scheduleFormState
  });

  // Set the default values for the template form
  const defaultTemplateValue: TemplateType = {};

  // Use for to initially assign default values
  const { control: control2, setValue: setValue2 } = useForm({
    defaultValues: defaultTemplateValue
  });

  // Handle the submit of the form
  const onSubmit: SubmitHandler<IScheduleFormState> = (data) => {
    console.log('Form Submitted', data, getValues());
    // Map the correct data
    // FORM's endDateTime will be saved to originalEndDateTime
    // DB's endDateTime will save the projectedEndDateTime
    const { releaseFrequency, startDateTime, endDateTime } = data;
    if (startDateTime && endDateTime) {
      const numberOfReleases = getNumberOfReleases(releaseFrequency, startDateTime, endDateTime);
      const projectedEndDateTime = getProjectedEndDateTime(
        startDateTime,
        endDateTime,
        numberOfReleases,
        DATE_FREQ_TO_TIMESTAMP[releaseFrequency]
      );
      updateScheduleFormState({
        ...scheduleFormState,
        ...data,
        originalEndDateTime: endDateTime,
        endDateTime: projectedEndDateTime
      });
      Router.push('/vesting-schedule/add-beneficiary');
    }
  };

  // Form fields
  const startDateTime = { value: watch('startDateTime'), state: getFieldState('startDateTime') };
  const endDateTime = { value: watch('endDateTime'), state: getFieldState('endDateTime') };
  const cliffDuration = { value: watch('cliffDuration'), state: getFieldState('cliffDuration') };
  const lumpSumReleaseAfterCliff = {
    value: watch('lumpSumReleaseAfterCliff'),
    state: getFieldState('lumpSumReleaseAfterCliff')
  };
  const releaseFrequency = { value: watch('releaseFrequency'), state: getFieldState('releaseFrequency') };
  const amountToBeVested = { value: watch('amountToBeVested'), state: getFieldState('amountToBeVested') };

  console.log('Lumpsum release', lumpSumReleaseAfterCliff.value);
  // Supporting variables
  const tokenSupply = mintFormState.initialSupply || 100000;

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
    // { label: 'Minute', value: 'minute' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  // Handle the changes made when updating the amount to be vested.
  const handleMinChange = (e: any) => {
    console.log('Min changed', +e.target.value, tokenSupply);
    setValue('amountToBeVested', +e.target.value);
  };

  // These are used to show/hide the date or time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // These will be used to store current selection of date and time
  const [pickerStartDateTime, setPickerStartDateTime] = useState(new Date());
  const [pickerEndDateTime, setPickerEndDateTime] = useState(new Date());

  // Shows the calendar set when a date input is focused
  const handleFocusDatePicker = () => {
    setShowDatePicker(true);
  };

  // Shows the time selection set when a time input is focused
  const handleFocusTimePicker = () => {
    setShowTimePicker(true);
  };

  // Handlers for the template input
  // Create function that returns an object for the options list -- lowercased and no spaces.
  const createTemplate = (label: string) => ({ label, value: label.toLocaleLowerCase().replace(/W/g, '') });
  // Sets the initial default recipient options -- will probably need to adjust this later on.
  // Should base from data fetched from firestore
  const templateDefaultOptions: IVestingTemplate[] = [];

  const [templateOptions, setTemplateOptions] = useState(templateDefaultOptions);
  const [templateLoading, setTemplateLoading] = useState(false);

  /**
   * From https://react-select.com/creatable
   * Handle the onChange event of the recipient type -- when the user selects from the options.
   * We set the form value here.
   * @param newValue
   * @param actionMeta
   */
  const onTemplateChange = (
    newValue: OnChangeValue<IVestingTemplate, false>,
    actionMeta: ActionMeta<IVestingTemplate>
  ) => {
    console.log('Changing vaule', newValue, actionMeta);
    if (actionMeta.action === 'clear') {
      // remove selection
      setValue2('template', null);
      handleTemplateChange(scheduleFormState);
    } else if (newValue) {
      console.group('Value Changed');
      console.log(newValue);
      console.log(`action: ${actionMeta.action}`);
      console.groupEnd();
      setValue2('template', newValue);
      handleTemplateChange(newValue?.details);
    }
  };

  // This function updates the current form based on the selected template.
  const handleTemplateChange = (details: IScheduleFormState) => {
    // Need to create the details as new so as to not bind the current template values, which makes these datas still editable and customizable.
    const newDetails = { ...details };
    // Due to dates are typed as Timestamps in firebase, we need to use a function for that.
    const actualDateTime = getActualDateTime(newDetails);
    console.log('Changing template', actualDateTime.startDate, actualDateTime.endDate);
    setValue('amountToBeVested', newDetails.amountToBeVested);
    setValue('startDateTime', actualDateTime.startDate);
    setValue('endDateTime', actualDateTime.endDate);
    setValue('releaseFrequency', newDetails.releaseFrequency);
    setValue('cliffDuration', newDetails.cliffDuration);
    setValue('lumpSumReleaseAfterCliff', newDetails.lumpSumReleaseAfterCliff);
  };

  /**
   * From react-select
   * Handles the onCreateOption event of the template -- when the user tries to select own value.
   * Save the newly added option to the database -- includes the vesting schedule configuration form datas a name and timestamps.
   * @param inputValue
   */
  const onCreateTemplate = async (inputValue: string) => {
    setTemplateLoading(true);
    try {
      // Validate current values of the form
      // Should not be the default values
      if (organizationId && endDateTime.value && startDateTime.value) {
        setValue2('template', null);
        const selectOption = createTemplate(inputValue);
        const newOption = {
          name: selectOption.label,
          label: selectOption.label,
          value: selectOption.value,
          details: {
            startDateTime: startDateTime.value,
            originalEndDateTime: endDateTime.value,
            endDateTime: endDateTime.value,
            cliffDuration: cliffDuration.value,
            lumpSumReleaseAfterCliff: lumpSumReleaseAfterCliff.value,
            releaseFrequency: releaseFrequency.value,
            amountToBeVested: amountToBeVested.value,
            tokenId,
            tokenAddress: mintFormState.address,
            amountClaimed: 0,
            amountUnclaimed: 0
          },
          createdAt: Math.floor(new Date().getTime() / 1000),
          updatedAt: Math.floor(new Date().getTime() / 1000),
          organizationId: organizationId
        };
        const diffSeconds = differenceInSeconds(endDateTime.value, startDateTime.value);
        if (amountToBeVested.value && diffSeconds) {
          const vestingTemplate = await createVestingTemplate(newOption);
          setTemplateOptions([...templateOptions, newOption]);
          setValue2('template', newOption);
          setTemplateLoading(false);
          toast.success(`Template ${newOption.label} saved!`);
        } else {
          // Show error message about the values being default
          setFormError(true);
          setFormMessage(
            'Please fill in the form. Dates should be different, Amount to be vested should be greater than 0'
          );
          setTemplateLoading(false);
          toast.error('Template not saved! Please fill in the form.');
        }
      } else throw 'No organizationId';
    } catch (err) {
      // Something went wrong in creating a template
      setTemplateLoading(false);
      toast.error('Oops! something went wrong');
    }
  };

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

  // Fetch the list of templates available
  useEffect(() => {
    if (organizationId) {
      fetchVestingTemplatesByQuery('organizationId', '==', organizationId).then((res) => {
        // Update option list for the template
        const transformedDatas = res.map((record) => {
          // Due to dates are typed as Timestamps in firebase, we need to use a function for that.
          const actualDateTime = getActualDateTime(record.data.details);
          return {
            id: record.id,
            ...record.data,
            startDateTime: actualDateTime.startDate,
            endDateTime: actualDateTime.endDate
          };
        });
        setTemplateOptions(transformedDatas);
      });
    }
  }, [organizationId]);

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

  const handleDateTimeChange = (e: any, field: string) => {
    if (field.includes('start')) {
      setPickerStartDateTime(e);
    }

    if (field.includes('end')) {
      setPickerEndDateTime(e);
    }
  };

  // Reset the state of the picker date time and do not update the form value
  // close the picker
  const handleActionBarCancel = (field: CustomActionBarDateTimeField) => {
    // Reset the date time values
    if ((field === 'startTime' || field === 'startDate') && startDateTime.value) {
      setPickerStartDateTime(startDateTime.value);
    }

    if ((field === 'endTime' || field === 'endDate') && endDateTime.value) {
      setPickerEndDateTime(endDateTime.value);
    }

    // Close the corresponding picker
    if (field === 'startTime' || field === 'endTime') {
      setShowTimePicker(false);
    }

    if (field === 'startDate' || field === 'endDate') {
      setShowDatePicker(false);
    }
  };

  // Set the value of the date time in the form into the state of selected date time
  // Close the picker
  const handleActionBarAccept = (field: CustomActionBarDateTimeField) => {
    // Update the date time form values
    if ((field === 'startTime' || field === 'startDate') && startDateTime.value) {
      setValue('startDateTime', pickerStartDateTime);
    }

    if ((field === 'endTime' || field === 'endDate') && endDateTime.value) {
      setValue('endDateTime', pickerEndDateTime);
    }

    // Close the corresponding picker
    if (field === 'startTime' || field === 'endTime') {
      setShowTimePicker(false);
    }

    if (field === 'startDate' || field === 'endDate') {
      setShowDatePicker(false);
    }
  };

  const CustomActionBar = ({ field }: CustomActionBarProps) => {
    return (
      <div className="row-center justify-end mt-3">
        <button className="uppercase small line primary" onClick={() => handleActionBarCancel(field)}>
          Cancel
        </button>
        <button className="uppercase small primary" onClick={() => handleActionBarAccept(field)}>
          Ok
        </button>
      </div>
    );
  };

  const ActionBarStartDate: ElementType<PickersActionBarProps> = () => <CustomActionBar field="startDate" />;
  const ActionBarStartTime: ElementType<PickersActionBarProps> = () => <CustomActionBar field="startTime" />;
  const ActionBarEndDate: ElementType<PickersActionBarProps> = () => <CustomActionBar field="endDate" />;
  const ActionBarEndTime: ElementType<PickersActionBarProps> = () => <CustomActionBar field="endTime" />;

  // Updates the current Date and Time input states when the actual form values change.
  useEffect(() => {
    if (isScheduleValid()) {
      if (startDateTime.value && endDateTime.value) {
        setPickerStartDateTime(startDateTime.value);
        setPickerEndDateTime(endDateTime.value);
      }
      // Remove formErrors if any when these data changes
      setFormError(false);
      setFormMessage('');
    }
  }, [startDateTime.value, endDateTime.value]);

  useEffect(() => {
    if (isScheduleValid()) {
      setFormError(false);
      setFormMessage('');
    }
  }, [amountToBeVested.value]);

  // Update form error message when the dates and cliff duration does not match
  useEffect(() => {
    const validity = isScheduleValid();
  }, [startDateTime.value, endDateTime.value, cliffDuration.value]);

  const isScheduleValid = () => {
    if (startDateTime.value && endDateTime.value && cliffDuration.value !== 'no-cliff') {
      // Compute duration of start and end dates
      const diffSeconds = differenceInSeconds(endDateTime.value, startDateTime.value);
      const releaseFreqSeconds = DATE_FREQ_TO_TIMESTAMP[releaseFrequency.value];
      const cliffSeconds = CLIFFDURATION_TIMESTAMP[cliffDuration.value];
      const idealScheduleDuration = cliffSeconds + releaseFreqSeconds;
      console.log('Difference', idealScheduleDuration, diffSeconds);
      // Compare to cliff duration
      if (idealScheduleDuration > diffSeconds) {
        // Error
        setFormError(true);
        setFormSuccess(false);
        setFormMessage(
          'Cliff duration and release frequency should fall within the Start date and End date of the schedule.'
        );
        return false;
      } else if (formError) {
        // Convert to successful if the state came from an error
        setFormError(false);
        setFormSuccess(true);
        setFormMessage('');
      }
    }
    return true;
  };

  // Update the lumpsum value after cliff on change.
  // Currently, react-number-format returns it's value as a string with % sign.
  // To do: Refactor this later and move it's responsibility to the <Input type="percent" /> component.
  useEffect(() => {
    if (typeof lumpSumReleaseAfterCliff.value === 'string' && lumpSumReleaseAfterCliff.value !== '') {
      setValue('lumpSumReleaseAfterCliff', +lumpSumReleaseAfterCliff.value.slice(0, -1));
    }
  }, [lumpSumReleaseAfterCliff.value]);

  /**
   * This section is used for anything that regards the Vesting Schedule templates
   * Should feature the ff:
   * 1. Fetch all available template for a particular organizationId.
   * 2. Selecting a template will automatically populate the configuration form.
   * 2.1 Prompt the user first that the configuration form will be overwritten.
   * 3. Typing / Creating a template will save the current configuration form data into the new template document.
   */

  return (
    <>
      <div className="grid md:grid-cols-12 w-full gap-3.5">
        <div className="md:col-span-7">
          <Form
            isSubmitting={isSubmitting}
            className="w-full mb-6"
            onSubmit={handleSubmit(onSubmit)}
            error={formError}
            success={formSuccess}
            message={formMessage}>
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
                      onFocus={handleFocusDatePicker}
                    />
                    {showDatePicker ? (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                          displayStaticWrapperAs="mobile"
                          value={pickerStartDateTime}
                          onChange={(newValue) => {
                            handleDateTimeChange(newValue, 'startDate');
                          }}
                          renderInput={(params) => <TextField {...params} />}
                          components={{
                            ActionBar: ActionBarStartDate
                          }}
                        />
                      </LocalizationProvider>
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
                      onFocus={handleFocusDatePicker}
                    />
                    {showDatePicker ? (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                          displayStaticWrapperAs="mobile"
                          value={pickerEndDateTime}
                          onChange={(newValue) => {
                            handleDateTimeChange(newValue, 'endDate');
                          }}
                          renderInput={(params) => <TextField {...params} />}
                          components={{
                            ActionBar: ActionBarEndDate
                          }}
                        />
                      </LocalizationProvider>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mb-5">
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
                  <>
                    <Input
                      type="text"
                      label="Start time"
                      required
                      value={format(startDateTime.value, 'hh:mm a')}
                      onFocus={handleFocusTimePicker}
                    />
                    {showTimePicker ? (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticTimePicker
                          displayStaticWrapperAs="mobile"
                          value={pickerStartDateTime}
                          onChange={(newValue) => {
                            handleDateTimeChange(newValue, 'startTime');
                          }}
                          renderInput={(params) => <TextField {...params} />}
                          components={{
                            ActionBar: ActionBarStartTime
                          }}
                        />
                      </LocalizationProvider>
                    ) : null}
                  </>
                ) : null}
              </div>
              <div>
                {endDateTime.value ? (
                  <>
                    <Input
                      label="End time"
                      required
                      value={format(endDateTime.value, 'h:mm aa')}
                      onFocus={handleFocusTimePicker}
                    />
                    {showTimePicker ? (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticTimePicker
                          displayStaticWrapperAs="mobile"
                          value={pickerEndDateTime}
                          onChange={(newValue) => {
                            handleDateTimeChange(newValue, 'endTime');
                          }}
                          renderInput={(params) => <TextField {...params} />}
                          components={{
                            ActionBar: ActionBarEndTime
                          }}
                        />
                      </LocalizationProvider>
                    ) : null}
                  </>
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
                        type="percent"
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
                  initial={+amountToBeVested.value}
                  maximum={+tokenSupply}
                  onMinChange={handleMinChange}
                  onUseMax={() => setValue('amountToBeVested', +tokenSupply)}
                  maxReadOnly
                />
              </div>
            </div>
            <div className="flex flex-row justify-end items-center border-t border-neutral-200 pt-5">
              <Button className="primary" type="submit" loading={isSubmitting} disabled={formError}>
                Continue
              </Button>
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
                      {...field}
                      isLoading={templateLoading}
                      allowCreateWhileLoading
                      formatCreateLabel={(inputValue: string) => <CreateLabel inputValue={inputValue} />}
                      onCreateOption={onCreateTemplate}
                      options={templateOptions}
                      isClearable
                      value={field.value || null}
                      onChange={onTemplateChange}
                      placeholder={templateLoading ? `Saving template...` : 'Find or type to create template'}
                      noOptionsMessage={() => 'Type to create a template'}
                      className="select-container"
                      classNamePrefix="select"
                    />
                    {fieldState.error ? (
                      <div className="text-danger-500 text-xs mt-1 mb-3">Please select or enter a template</div>
                    ) : null}
                  </label>
                )}
              />
            </div>
            <ScheduleDetails {...getValues()} token={mintFormState.symbol || 'Token'} layout="small" />
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
