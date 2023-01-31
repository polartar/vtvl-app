import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import CreateLabel from '@components/atoms/CreateLabel/CreateLabel';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Checkbox from '@components/atoms/FormControls/Checkbox/Checkbox';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import QuantityInput from '@components/atoms/FormControls/QuantityInput/QuantityInput';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import RangeSlider from '@components/atoms/FormControls/RangeSlider/RangeSlider';
import StepLabel from '@components/atoms/FormControls/StepLabel/StepLabel';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import TextField from '@mui/material/TextField';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { StaticTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAuthContext } from '@providers/auth.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import add from 'date-fns/add';
import differenceInHours from 'date-fns/differenceInHours';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import format from 'date-fns/format';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { IScheduleFormState, useVestingContext } from 'providers/vesting.context';
import { ElementType, ForwardedRef, ReactElement, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActionMeta, OnChangeValue, SingleValue } from 'react-select';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import { createVestingTemplate, fetchVestingTemplatesByQuery } from 'services/db/vestingTemplate';
import { CliffDuration, DateDurationOptionValues, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IVestingTemplate } from 'types/models';
import { getActualDateTime, scrollIntoView } from 'utils/shared';
import { formatNumber } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDurationTimestamp,
  getNumberOfReleases,
  getReleaseFrequencyTimestamp
} from 'utils/vesting';

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

const defaultCliffDurationOption: DateDurationOptionValues | CliffDuration = 'no-cliff';

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
    setError,
    clearErrors,
    formState: { errors, isSubmitting, touchedFields, dirtyFields, isDirty }
  } = useForm({
    defaultValues: {
      ...scheduleFormState,
      // Set default amount to be vested to be the total token supply
      amountToBeVested: parseFloat(mintFormState.initialSupply.toString()),
      amountToBeVestedText: formatNumber(parseFloat(mintFormState.initialSupply.toString())).toString(),
      cliffDurationNumber: 1,
      cliffDurationOption: defaultCliffDurationOption as CliffDuration | DateDurationOptionValues,
      releaseFrequencySelectedOption: 'continuous',
      customReleaseFrequencyNumber: 1,
      customReleaseFrequencyOption: 'days'
    }
  });

  // Set the default values for the template form
  const defaultTemplateValue: TemplateType = {};

  // Use for to initially assign default values
  const {
    control: tControl,
    watch: tWatch,
    getFieldState: tGetFieldState,
    setValue: tSetValue
  } = useForm({
    defaultValues: defaultTemplateValue
  });

  // Watch for template details
  const template = { value: tWatch('template'), state: tGetFieldState('template') };

  // Handle the submit of the form
  const onSubmit: SubmitHandler<IScheduleFormState> = async (data) => {
    // Validate schedule
    if (!isScheduleValid()) {
      return;
    }

    console.log('Form Submitted', data, getValues());
    // Check first if the user is saving the configuration as a template as well.
    if (saveAsTemplate.value) {
      if (templateName.value) {
        // Create the template and save it to the DB
        await onCreateTemplate(templateName.value);
      } else {
        fuSetError('templateName', { type: 'required', message: 'Template name is required' });
        return;
      }
    }

    // Map the correct data
    // FORM's endDateTime will be saved to originalEndDateTime
    // DB's endDateTime will save the projectedEndDateTime
    const { releaseFrequency, startDateTime, endDateTime, cliffDuration, amountToBeVested, lumpSumReleaseAfterCliff } =
      data;
    if (startDateTime && endDateTime) {
      // const numberOfReleases = getNumberOfReleases(releaseFrequency, startDateTime, endDateTime);
      const cliffAmount = getCliffAmount(cliffDuration, +lumpSumReleaseAfterCliff, amountToBeVested);
      const projectedEndDateTime = getChartData({
        start: startDateTime,
        end: endDateTime,
        cliffDuration,
        cliffAmount: cliffAmount,
        frequency: releaseFrequency,
        vestedAmount: amountToBeVested
      }).projectedEndDateTime;
      // getProjectedEndDateTime(
      //   startDateTime,
      //   endDateTime,
      //   numberOfReleases,
      //   releaseFrequency
      // );
      await updateScheduleFormState({
        ...scheduleFormState,
        ...data,
        originalEndDateTime: endDateTime,
        endDateTime: projectedEndDateTime
      });

      Router.push('/vesting-schedule/summary');
    }
  };

  // Form fields
  const startDateTime = { value: watch('startDateTime'), state: getFieldState('startDateTime') };
  const endDateTime = { value: watch('endDateTime'), state: getFieldState('endDateTime') };
  const cliffDuration = { value: watch('cliffDuration'), state: getFieldState('cliffDuration') };
  // Stores the count portion of the cliffDuration
  const cliffDurationNumber = { value: watch('cliffDurationNumber'), state: getFieldState('cliffDurationNumber') };
  // Stores the duration itself of the cliffDuration
  const cliffDurationOption = { value: watch('cliffDurationOption'), state: getFieldState('cliffDurationOption') };
  const lumpSumReleaseAfterCliff = {
    value: watch('lumpSumReleaseAfterCliff'),
    state: getFieldState('lumpSumReleaseAfterCliff')
  };

  // Stores the actual release frequency value -- the one that is submitted and saved to the DB
  const releaseFrequency = { value: watch('releaseFrequency'), state: getFieldState('releaseFrequency') };

  // This stores an arbitrary value to cater the active state of the 'custom' pill when selected
  const releaseFrequencySelectedOption = {
    value: watch('releaseFrequencySelectedOption'),
    state: getFieldState('releaseFrequencySelectedOption')
  };

  // Stores the custom release frequency count before updating the actual release frequency
  const customReleaseFrequencyNumber = {
    value: watch('customReleaseFrequencyNumber'),
    state: getFieldState('customReleaseFrequencyNumber')
  };

  // Stores the custom release frequency option before updating the actual release frequency
  const customReleaseFrequencyOption = {
    value: watch('customReleaseFrequencyOption'),
    state: getFieldState('customReleaseFrequencyOption')
  };

  const amountToBeVested = { value: watch('amountToBeVested'), state: getFieldState('amountToBeVested') };
  // Stores the text version of the amount to be vested value
  const amountToBeVestedText = { value: watch('amountToBeVestedText'), state: getFieldState('amountToBeVestedText') };

  console.log('Lumpsum release', lumpSumReleaseAfterCliff.value);

  const cliffOptions = [
    { label: 'No cliff', value: 'no-cliff' },
    // { label: 'Hours', value: 'hours' },
    // { label: 'Days', value: 'days' },
    { label: 'Weeks', value: 'weeks' },
    { label: 'Months', value: 'months' },
    { label: 'Years', value: 'years' }
    // { label: '1 hour', value: '1-hour' },
    // { label: '6 hours', value: '6-hours' },
    // { label: '12 hours', value: '12-hours' },
    // { label: '1 day', value: '1-day' },
    // { label: '5 days', value: '5-days' },
    // { label: '2 weeks', value: '2-weeks' },
    // { label: '1 month', value: '1-month' },
    // { label: '3 months', value: '3-months' },
    // { label: '6 months', value: '6-months' },
    // { label: '1 year', value: '1-year' }
  ];

  /**
   * Simple function to remove the 's' of the duration label
   */
  const formatCliffDurationOption = (duration: number, label: DateDurationOptionValues | CliffDuration) => {
    return label.charAt(label.length - 1) === 's' && +duration === 1 ? label.slice(0, -1) : label;
  };

  /**
   * Add a listener for the new implementation of the cliff duration
   * Cliff duration contains two parts
   * 1. the number ie., 1, 2 etc.
   * 2. the type of duration ie., year, month etc.
   * the cliffDuration.value should contain a format like these:
   * 1-year / 2-years
   * 1-month / 2-months
   * 1-week / 2-weeks
   * 1-day / 2-days
   * 1-hour / 2-hours
   * no-cliff
   *
   * cannot and should not contain 0 starting value like 0-day etc.
   */
  useEffect(() => {
    // Update the cliffDuration actual value based on these two inputs
    if (cliffDurationNumber.value && cliffDurationOption.value) {
      if (cliffDurationOption.value === 'no-cliff') {
        setValue('cliffDuration', cliffDurationOption.value);
      } else {
        const formattedLabel = formatCliffDurationOption(+cliffDurationNumber.value, cliffDurationOption.value);
        setValue('cliffDuration', `${cliffDurationNumber.value}-${formattedLabel as DateDurationOptionValues}`);
      }
    }

    // Trigger an error in the cliff duration when the number is 0 if there is a cliff
    clearErrors('cliffDurationNumber');
    if (!+cliffDurationNumber.value && cliffDurationOption.value !== 'no-cliff') {
      setError('cliffDurationNumber', {
        type: 'custom',
        message: `Please enter number of ${cliffDurationOption.value}`
      });
    }
  }, [cliffDurationNumber.value, cliffDurationOption.value]);

  // Update the releaseFrequency form control when the releaseFrequencySelectedOption changes
  useEffect(() => {
    setValue(
      'releaseFrequency',
      (releaseFrequencySelectedOption.value === 'custom'
        ? `every-${customReleaseFrequencyNumber.value}-${customReleaseFrequencyOption.value}`
        : releaseFrequencySelectedOption.value) as ReleaseFrequency
    );
  }, [releaseFrequencySelectedOption.value, customReleaseFrequencyNumber.value, customReleaseFrequencyOption.value]);

  const radioOptions = [
    { label: 'Continuous', value: 'continuous' },
    // { label: 'Minute', value: 'minute' },
    // { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    // { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Custom', value: 'custom' }
  ];

  const customReleaseFrequencyOptions = [
    { label: 'Days', value: 'days' },
    { label: 'Weeks', value: 'weeks' },
    { label: 'Months', value: 'months' },
    { label: 'Years', value: 'years' }
  ];

  const handlePlusQuantity = () => {
    setValue('customReleaseFrequencyNumber', +customReleaseFrequencyNumber.value + 1);
  };

  const handleMinusQuantity = () => {
    if (customReleaseFrequencyNumber.value > 1) {
      setValue('customReleaseFrequencyNumber', +customReleaseFrequencyNumber.value - 1);
    }
  };

  // Handle the changes made when updating the amount to be vested.
  const handleMinChange = (e: any) => {
    console.log('Min changed', e);
    // setValue('amountToBeVested', +e.target.value);
  };

  // These are used to show/hide the date or time pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  // These will be used to store current selection of date and time
  const [pickerStartDateTime, setPickerStartDateTime] = useState(new Date());
  const [pickerEndDateTime, setPickerEndDateTime] = useState(new Date());

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
      tSetValue('template', null);
      handleTemplateChange(scheduleFormState);
    } else if (newValue) {
      console.group('Value Changed');
      console.log(newValue);
      console.log(`action: ${actionMeta.action}`);
      console.groupEnd();
      tSetValue('template', newValue);
      handleTemplateChange(newValue?.details);
    }
  };

  // This function updates the current form based on the selected template.
  const handleTemplateChange = (details: IScheduleFormState) => {
    // Need to create the details as new so as to not bind the current template values, which makes these datas still editable and customizable.
    const newDetails = { ...details };
    // Due to dates are typed as Timestamps in firebase, we need to use a function for that.
    const actualDateTime = getActualDateTime(newDetails);
    console.log('Changing template', actualDateTime.startDateTime, actualDateTime.endDateTime);
    setValue('amountToBeVested', newDetails.amountToBeVested);
    setValue('startDateTime', actualDateTime.startDateTime);
    setValue('endDateTime', actualDateTime.endDateTime);
    setValue('releaseFrequency', newDetails.releaseFrequency);
    setValue('cliffDuration', newDetails.cliffDuration);
    setValue('lumpSumReleaseAfterCliff', newDetails.lumpSumReleaseAfterCliff);
    // Set values for the arbitrary ones
    setValue('amountToBeVestedText', formatNumber(newDetails.amountToBeVested).toString());

    // Cliff duration checks
    if (newDetails.cliffDuration === 'no-cliff') {
      setValue('cliffDurationNumber', 1);
      setValue('cliffDurationOption', 'no-cliff');
    } else {
      const cliffSplit = newDetails.cliffDuration.split('-');
      const cliffOption = cliffSplit[1].charAt(cliffSplit[1].length - 1) !== 's' ? `${cliffSplit[1]}s` : cliffSplit[1];
      setValue('cliffDurationNumber', +cliffSplit[0]);
      setValue('cliffDurationOption', cliffOption as CliffDuration | DateDurationOptionValues);
    }

    // Release frequency checks
    let selectedFrequency = newDetails.releaseFrequency as string;
    let frequencyNumber = 0;
    let frequencyOption = 'hours';

    if (newDetails.releaseFrequency.includes('every')) {
      // Set selected to custom
      selectedFrequency = 'custom';

      // Set the right number and selected option
      const freqValueSplit = newDetails.releaseFrequency.split('-');
      frequencyNumber = +freqValueSplit[1];
      frequencyOption = freqValueSplit[2];
    } else {
      // Default number to 1 when using the regular frequency
      frequencyNumber = 1;
      // Update option based on the frequency
      switch (newDetails.releaseFrequency) {
        case 'continuous':
          frequencyOption = 'seconds';
          break;
        case 'minute':
          frequencyOption = 'minute';
          break;
        case 'hourly':
          frequencyOption = 'hours';
          break;
        case 'daily':
          frequencyOption = 'days';
          break;
        case 'weekly':
          frequencyOption = 'weeks';
          break;
        case 'monthly':
          frequencyOption = 'months';
          break;
        case 'yearly':
          frequencyOption = 'years';
          break;
        default:
          break;
      }
    }
    // Set the selected values
    setValue('releaseFrequencySelectedOption', selectedFrequency);
    setValue('customReleaseFrequencyNumber', frequencyNumber);
    setValue('customReleaseFrequencyOption', frequencyOption);

    // Focus on step 1
    setTimeout(() => {
      if (step[0].ref && step[0].ref.current) {
        step[0].ref.current?.focus();
        scrollIntoView(step[0].ref.current);
      }
    }, 300);
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
        tSetValue('template', null);
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
            cliffDurationOption: cliffDurationOption.value,
            cliffDurationNumber: cliffDurationNumber.value,
            lumpSumReleaseAfterCliff: lumpSumReleaseAfterCliff.value,
            releaseFrequency: releaseFrequency.value,
            releaseFrequencySelectedOption: releaseFrequencySelectedOption.value,
            customReleaseFrequencyNumber: customReleaseFrequencyNumber.value,
            customReleaseFrequencyOption: customReleaseFrequencyOption.value,
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
          tSetValue('template', newOption);
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
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime
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
    console.log('Quick add Date', startDateTime.value);
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

    // Focus on the step 2
    goToActiveStep(1);
  };

  const handleDateTimeChange = (e: any, field: string) => {
    let newDate = e;
    // Ensure that changing the date will update the time into 00:00
    if (field.includes('Date')) {
      newDate = new Date(new Date(e).setHours(0, 0, 0, 0));
    }

    console.log('Date time changing', newDate, field);
    if (field.includes('start')) {
      setValue('startDateTime', newDate);
      // setPickerStartDateTime(newDate);
    }

    if (field.includes('end')) {
      setValue('endDateTime', newDate);
      // setPickerEndDateTime(newDate);
    }
  };

  const handleHidePickers = (field: CustomActionBarDateTimeField) => {
    // Close the corresponding picker
    switch (field) {
      case 'startTime':
        setShowStartTimePicker(false);
        break;
      case 'endTime':
        setShowEndTimePicker(false);
        // Focus on the step 3 section
        goToActiveStep(2);
        break;
      case 'startDate':
        setShowStartDatePicker(false);
        break;
      case 'endDate':
        setShowEndDatePicker(false);
        // Focus on the step 2 section
        goToActiveStep(1);
        break;
      default:
        break;
    }
  };

  // Reset the state of the picker date time and do not update the form value
  // close the picker
  // const handleActionBarCancel = (field: CustomActionBarDateTimeField) => {
  //   // Reset the date time values
  //   if ((field === 'startTime' || field === 'startDate') && startDateTime.value) {
  //     setPickerStartDateTime(startDateTime.value);
  //   }

  //   if ((field === 'endTime' || field === 'endDate') && endDateTime.value) {
  //     setPickerEndDateTime(endDateTime.value);
  //   }

  //   handleHidePickers(field);
  // };

  // Set the value of the date time in the form into the state of selected date time
  // Close the picker
  // const handleActionBarAccept = (field: CustomActionBarDateTimeField) => {
  //   // Update the date time form values
  //   if ((field === 'startTime' || field === 'startDate') && startDateTime.value) {
  //     setValue('startDateTime', pickerStartDateTime);
  //   }

  //   if ((field === 'endTime' || field === 'endDate') && endDateTime.value) {
  //     setValue('endDateTime', pickerEndDateTime);
  //   }

  //   // Close the corresponding picker
  //   handleHidePickers(field);
  // };

  // const CustomActionBar = ({ field }: CustomActionBarProps) => {
  //   return (
  //     <div className="row-center justify-end mt-3">
  //       <button className="uppercase small line primary" onClick={() => handleActionBarCancel(field)}>
  //         Cancel
  //       </button>
  //       <button className="uppercase small primary" onClick={() => handleActionBarAccept(field)}>
  //         Ok
  //       </button>
  //     </div>
  //   );
  // };

  // const ActionBarStartDate: ElementType<PickersActionBarProps> = () => <CustomActionBar field="startDate" />;
  // const ActionBarStartTime: ElementType<PickersActionBarProps> = () => <CustomActionBar field="startTime" />;
  // const ActionBarEndDate: ElementType<PickersActionBarProps> = () => <CustomActionBar field="endDate" />;
  // const ActionBarEndTime: ElementType<PickersActionBarProps> = () => <CustomActionBar field="endTime" />;

  // Updates the current Date and Time input states when the actual form values change.
  // useEffect(() => {
  //   if (isScheduleValid()) {
  //     if (startDateTime.value && endDateTime.value) {
  //       setPickerStartDateTime(startDateTime.value);
  //       setPickerEndDateTime(endDateTime.value);
  //     }
  //     // Remove formErrors if any when these data changes
  //     setFormError(false);
  //     setFormMessage('');
  //   }
  // }, [startDateTime.value, endDateTime.value]);

  useEffect(() => {
    if (isScheduleValid()) {
      setFormError(false);
      setFormSuccess(true);
      setFormMessage('');
    } else {
      setFormError(true);
      setFormSuccess(false);
      setFormMessage('');
    }
  }, [amountToBeVested.value]);

  // Update form error message when the dates and cliff duration does not match
  useEffect(() => {
    const validity = isScheduleValid();
  }, [startDateTime.value, endDateTime.value, cliffDuration.value]);

  const isScheduleValid = () => {
    if (startDateTime.value && endDateTime.value) {
      // Compute duration of start and end dates
      const diffSeconds = differenceInSeconds(endDateTime.value, startDateTime.value);
      const diffHours = differenceInHours(endDateTime.value, startDateTime.value);
      const releaseFreqSeconds = getReleaseFrequencyTimestamp(startDateTime.value, releaseFrequency.value);
      const cliffSeconds = getCliffDurationTimestamp(cliffDuration.value, startDateTime.value);
      const idealScheduleDuration = cliffSeconds + releaseFreqSeconds;
      console.log('Difference', idealScheduleDuration, diffSeconds, releaseFreqSeconds, cliffSeconds);
      // Compare to cliff duration

      if (diffHours < 24) {
        setFormError(true);
        setFormSuccess(false);
        setFormMessage('End date must be at least 24 hours after the start date');
        return false;
      }

      if (cliffDuration.value !== 'no-cliff' && idealScheduleDuration > diffSeconds) {
        // Error
        setFormError(true);
        setFormSuccess(false);
        setFormMessage(
          'Cliff duration and release frequency should fall within the Start date and End date of the schedule.'
        );
        return false;
      }
    }

    if (!amountToBeVested.value) {
      setFormError(true);
      setFormSuccess(false);
      setFormMessage("Amount to be vested can't be 0");
      return false;
    }

    // Convert to successful if the state came from an error
    if (formError) {
      setFormError(false);
      setFormSuccess(true);
      setFormMessage('');
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

  const totalTokenSupply = parseFloat(mintFormState.initialSupply.toString());

  // Handles the clicking of the "MAX" button in the amount to be vested section
  const handleMaxAmount = () => {
    const newMaxValue = totalTokenSupply;
    setValue('amountToBeVested', newMaxValue);
    setValue('amountToBeVestedText', formatNumber(newMaxValue).toString());
    clearErrors('amountToBeVestedText');

    // Make the amount to be vested an active section
    setActiveStep(4);
  };

  // Updates made when the user is interacting with the Range Slider component
  // Should also update the text value -- for display -- of the number input
  const handleAmountToBeVestedChange = (e: any) => {
    const newValue = parseFloat(e.target.value);
    // setValue('amountToBeVested', newValue);
    setValue('amountToBeVestedText', formatNumber(newValue).toString());
    clearErrors('amountToBeVestedText');

    // Make the amount to be vested an active section
    setActiveStep(4);
  };

  // Add additional fields to contain the text value of the inputted numbers -- AMOUNT TO BE VESTED.
  // Then updating the numeric value based on the current value of the text
  useEffect(() => {
    // Parse the text into floats to cater the decimals if any
    const amountToBeVestedToFloat = parseFloat(amountToBeVestedText.value.replaceAll(',', ''));
    setValue('amountToBeVested', !isNaN(amountToBeVestedToFloat) ? amountToBeVestedToFloat : 0);
  }, [amountToBeVestedText.value]);

  /**
   * This section is used for anything that regards the Vesting Schedule templates
   * Should feature the ff:
   * 1. Fetch all available template for a particular organizationId.
   * 2. Selecting a template will automatically populate the configuration form.
   * 2.1 Prompt the user first that the configuration form will be overwritten.
   * 3. Typing / Creating a template will save the current configuration form data into the new template document.
   */

  // Stores the state for the initial loading of configuration form.
  // Ask the user if they want to use existing templates or just start from scratch.
  const {
    control: fuControl,
    handleSubmit: fuSubmitHandler,
    watch: fuWatch,
    getFieldState: fuGetFieldState,
    getValues: fuGetValues,
    setValue: fuSetValue,
    setError: fuSetError,
    clearErrors: fuClearErrors,
    formState: { errors: fuErrors, isSubmitting: fuIsSubmitting }
  } = useForm({
    defaultValues: {
      formUsage: '',
      templateName: '',
      saveAsTemplate: false
    }
  });

  // Stores all related data about the template prompt and its behavior.
  const formUsage = { value: fuWatch('formUsage'), state: fuGetFieldState('formUsage') };
  const templateName = { value: fuWatch('templateName'), state: fuGetFieldState('templateName') };
  const saveAsTemplate = { value: fuWatch('saveAsTemplate'), state: fuGetFieldState('saveAsTemplate') };

  // Checks for the prompt status first before letting the user interact with the form
  const isUserTemplatePromptActive = () => {
    // If there is no selected option in the prompt
    if (!formUsage.value) return true;
    // If the user selects to use saved templates but does not yet select one
    if (formUsage.value === 'USE_TEMPLATE' && !template.value) return true;
    return false;
  };

  // Automatically selects the "start from scratch" option when there is no template available.
  useEffect(() => {
    if (templateOptions && !templateOptions.length) {
      fuSetValue('formUsage', 'FROM_SCRATCH');
      setTimeout(() => {
        if (step[0].ref && step[0].ref.current) {
          step[0].ref.current?.focus();
          scrollIntoView(step[0].ref.current);
        }
      }, 300);
    } else {
      fuSetValue('formUsage', '');
    }
  }, [templateOptions]);

  // This contains step section auto focusing during interaction
  // Contains 5 steps by default
  const [step, setStep] = useState<{ active: boolean; isExpanded: boolean; interactionCount: number; ref: any }[]>([
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) }
  ]);

  const goToActiveStep = (indexUpdate: number) => {
    setActiveStep(indexUpdate);
    setTimeout(() => {
      if (step[indexUpdate].ref && step[indexUpdate].ref.current) {
        scrollIntoView(step[indexUpdate].ref.current);
        step[indexUpdate].ref.current?.focus();
      }
    }, 600);
  };

  const setActiveStep = (indexUpdate: number) => {
    setStep((prevState) => {
      const prevIndex = indexUpdate - 1;
      const newState = [...prevState].map((step, stepIndex) => {
        if (stepIndex === indexUpdate) {
          return { ...step, active: true, isExpanded: true };
        } else if (prevIndex >= 0 && stepIndex < indexUpdate) {
          return { ...step, active: false, isExpanded: false };
        } else {
          return { ...step, active: false };
        }
      });
      return newState;
    });
  };

  // Focuses on the 1st step when the current template usage value is from scratch
  useEffect(() => {
    if (formUsage.value && formUsage.value === 'FROM_SCRATCH') {
      goToActiveStep(0);
    }
  }, [formUsage.value]);

  // This contains the triggers for each section to focus after interacting with the form
  // Step 1 interaction -- Go to handleDateTimeChange
  // Step 2 interaction -- Go to handleDateTimeChange
  // useEffect(() => {
  //   // Step 3 interaction
  //   if (cliffDuration.value === 'no-cliff') {
  //     goToActiveStep(3);
  //   }
  // }, [cliffDuration.value]);

  // Step 4 interaction
  // useEffect(() => {
  //   if (
  //     releaseFrequencySelectedOption.value !== 'custom' ||
  //     (customReleaseFrequencyNumber.value && customReleaseFrequencyOption.value)
  //   ) {
  //     goToActiveStep(4);
  //   }
  // }, [releaseFrequency.value]);

  console.log('TOUCHED AND DIRTY', releaseFrequency.state.isTouched, releaseFrequency.state.isDirty);

  return (
    <div className="px-8">
      {/* TEMPLATE PROMPT AND SELECTION SECTION */}
      {templateOptions && templateOptions.length ? (
        <div className="w-full text-left">
          <label className="text-neutral-900 font-medium text-base">Do you want to use an existing template?</label>
          {/* PROMP SECTION */}
          <div className="inline-flex flex-col gap-2 mt-4">
            <Controller
              name="formUsage"
              control={fuControl}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  variant="input-style"
                  checked={formUsage.value === 'USE_TEMPLATE'}
                  label="Yes, I want to use saved template"
                  {...field}
                  value="USE_TEMPLATE"
                />
              )}
            />
            <Controller
              name="formUsage"
              control={fuControl}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  variant="input-style"
                  checked={formUsage.value === 'FROM_SCRATCH'}
                  label="No, I want to start from scratch"
                  {...field}
                  value="FROM_SCRATCH"
                />
              )}
            />
          </div>
          {/* TEMPLATE SELECTION SECTION */}
          {formUsage.value === 'USE_TEMPLATE' ? (
            <div className="mt-5 transition-all">
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
                control={tControl}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <label className="required">
                    <span className="text-sm text-neutral-700 font-medium mb-0">
                      Select from previously saved templates
                    </span>
                    <Select
                      {...field}
                      isLoading={templateLoading}
                      options={templateOptions}
                      isClearable
                      value={field.value || null}
                      onChange={onTemplateChange}
                      placeholder={templateLoading ? `Saving template...` : 'Search saved templates'}
                      noOptionsMessage={() => 'Type to search for saved templates'}
                      className="select-container mt-2.5"
                      classNamePrefix="select"
                    />
                    {fieldState.error ? (
                      <div className="text-danger-500 text-xs mt-1 mb-3">Please select or enter a template</div>
                    ) : null}
                  </label>
                )}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* CONFIGURATION FORM SECTION */}
      <div className={`grid md:grid-cols-12 w-full gap-3.5 mt-5 ${isUserTemplatePromptActive() ? 'opacity-20' : ''}`}>
        <div className="md:col-span-7">
          <Form
            isSubmitting={isSubmitting}
            className="w-full mb-6"
            padded={false}
            disabled={isUserTemplatePromptActive()}
            onSubmit={handleSubmit(onSubmit)}
            error={formError}
            success={formSuccess}
            message={formMessage}>
            {/* Step 1: Date selection section */}
            <StepLabel
              ref={step[0].ref}
              step={1}
              isExpanded={step[0].isExpanded}
              isActive={step[0].active}
              label="Date selection"
              className="rounded-t-3xl"
              required
              description={
                <>
                  Select the dates for when this schedule should{' '}
                  <strong>
                    <i>start</i>
                  </strong>{' '}
                  and{' '}
                  <strong>
                    <i>end</i>
                  </strong>
                  .
                </>
              }
              note="Or, make it easier by choosing from the selection of pre-defined lengths of time above."
              onFocus={() => setActiveStep(0)}>
              <div className="flex flex-row gap-3">
                {/* Step 1 start date section */}
                <div className="flex-grow">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={startDateTime.value}
                      onChange={(newValue) => {
                        handleDateTimeChange(newValue, 'startDate');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onFocus={() => {
                            // setShowStartDatePicker(true);
                            setActiveStep(0);
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-neutral-500 flex flex-row items-center justify-center h-10">
                  to
                </span>
                {/* Step 1 end date section */}
                <div className="flex-grow">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={endDateTime.value}
                      onChange={(newValue) => {
                        handleDateTimeChange(newValue, 'endDate');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onFocus={() => {
                            // setShowEndDatePicker(true);
                            setActiveStep(0);
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              {/* Step 1 quick date adding section */}
              {step[0] && (step[0].isExpanded || step[0].active) ? (
                <div className="mt-4 row-center flex-wrap">
                  {quickDates.map((quickDate, qdIndex) => (
                    <Chip
                      key={`Quick-date-${qdIndex}`}
                      label={quickDate.label}
                      rounded
                      color="alt"
                      className="cursor-pointer transform transition-all hover:-translate-y-px hover:bg-primary-900 hover:text-neutral-50 hover:border-primary-900"
                      onFocus={() => setActiveStep(0)}
                      onClick={() => addDateToSchedule(quickDate.value)}
                    />
                  ))}
                </div>
              ) : null}
            </StepLabel>

            <hr className="mx-6" />

            {/* Step 2: Time selection section */}
            <StepLabel
              step={2}
              ref={step[1].ref}
              isExpanded={step[1].isExpanded}
              isActive={step[1].active}
              label="Time selection"
              required
              description={
                <>
                  Customise the time for when this schedule should{' '}
                  <strong>
                    <i>start</i>
                  </strong>{' '}
                  and{' '}
                  <strong>
                    <i>end</i>
                  </strong>
                  .<br />
                  This is in your local timezone.
                </>
              }
              onFocus={() => setActiveStep(1)}>
              <div className="flex flex-row gap-3">
                {/* Step 2 start time section */}
                <div className="flex-grow">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      value={startDateTime.value}
                      onChange={(newValue) => {
                        handleDateTimeChange(newValue, 'startTime');
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-neutral-500 flex flex-row items-center justify-center h-10">
                  to
                </span>
                {/* Step 2 end time section */}
                <div className="flex-grow">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      value={endDateTime.value}
                      onChange={(newValue) => {
                        handleDateTimeChange(newValue, 'endTime');
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </StepLabel>

            <hr className="mx-6" />

            {/* Step 3: Cliff duration selection section */}
            <StepLabel
              step={3}
              ref={step[2].ref}
              isExpanded={step[2].isExpanded}
              isActive={step[2].active}
              label="Cliff duration"
              required
              description="Select the length of your lock-up period"
              hint={
                <>
                  A cliff typically means a period of time that must be passed before recipients start unlocking tokens.
                  Also known as the{' '}
                  <strong>
                    <i>“lock up”</i>
                  </strong>{' '}
                  period. Recipients will receive no tokens during this period.
                </>
              }
              onFocus={() => setActiveStep(2)}>
              {/* Step 3 cliff duration selection */}
              <Controller
                name="cliffDurationOption"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <BarRadio
                    options={cliffOptions}
                    required
                    error={Boolean(errors.cliffDurationOption)}
                    message={errors.cliffDurationOption ? 'Please select cliff duration' : ''}
                    variant="pill"
                    onFocus={() => setActiveStep(2)}
                    {...field}
                    onBlur={() => {
                      if (cliffDurationOption.value === 'no-cliff') setActiveStep(5);
                    }}
                  />
                )}
              />
              {cliffDurationOption.value === 'no-cliff' ? null : (
                <>
                  {/* Step 3 cliff duration value */}
                  <Controller
                    name="cliffDurationNumber"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <div className="relative mt-4">
                        <Input
                          placeholder={`Enter number of ${cliffDurationOption.value}`}
                          className="mt-4"
                          required
                          error={Boolean(fieldState.error)}
                          message={fieldState.error ? 'Please enter number of ' + cliffDurationOption.value : ''}
                          onFocus={() => setActiveStep(2)}
                          {...field}
                          onBlur={() => setActiveStep(5)}
                          type="number"
                        />
                        <span
                          className={`absolute top-0 right-0 transform transition-all text-sm text-neutral-700 ${
                            fieldState.error ? 'translate-y-3.5 -translate-x-4' : 'translate-y-2.5 -translate-x-3.5'
                          }`}>
                          {formatCliffDurationOption(+cliffDurationNumber.value, cliffDurationOption.value)}
                        </span>
                      </div>
                    )}
                  />

                  {/* Step 3 lumpsum release when there is cliff duration */}
                  <Controller
                    name="lumpSumReleaseAfterCliff"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState, formState }) => (
                      <Input
                        label="Tokens unlocked after cliff (0-99%)"
                        placeholder="Enter whole percentage amount"
                        className="mt-4"
                        required
                        error={Boolean(fieldState.error)}
                        message={fieldState.error ? 'Please enter lump sum amount' : ''}
                        onFocus={() => setActiveStep(2)}
                        {...field}
                        onBlur={() => setActiveStep(5)}
                        type="percent"
                      />
                    )}
                  />
                </>
              )}
            </StepLabel>

            <hr className="mx-6" />

            {/* Step 4: Release frequency section */}
            <StepLabel
              step={4}
              ref={step[3].ref}
              isExpanded={step[3].isExpanded}
              isActive={step[3].active}
              label="Release frequency"
              required
              description="Determine how often recipients will receive their tokens over the course of their schedule."
              hint="Our platform currently only supports linear vesting which dictates that the same amount of tokens be equally distributed to the recipient periodically by the frequency that you set."
              onFocus={() => setActiveStep(3)}>
              {/* Step 4 release frequency input */}
              <Controller
                name="releaseFrequencySelectedOption"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <BarRadio
                    options={radioOptions}
                    required
                    error={Boolean(errors.releaseFrequencySelectedOption)}
                    message={errors.releaseFrequencySelectedOption ? 'Please select release frequency' : ''}
                    variant="pill"
                    onFocus={() => setActiveStep(3)}
                    {...field}
                    onBlur={() => {
                      if (releaseFrequencySelectedOption.value !== 'custom') {
                        setActiveStep(5);
                      }
                    }}
                  />
                )}
              />
              {releaseFrequencySelectedOption.value === 'custom' ? (
                <>
                  <div className="flex flex-row items-center gap-3 mt-4">
                    <Controller
                      name="customReleaseFrequencyNumber"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <QuantityInput
                          placeholder="0"
                          error={Boolean(errors.customReleaseFrequencyNumber)}
                          onPlus={handlePlusQuantity}
                          onMinus={handleMinusQuantity}
                          onFocus={() => setActiveStep(3)}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="customReleaseFrequencyOption"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <BarRadio
                          className="flex-grow flex-shrink-0"
                          options={customReleaseFrequencyOptions}
                          required
                          error={Boolean(errors.customReleaseFrequencyOption)}
                          message={errors.customReleaseFrequencyOption ? 'Please select frequency' : ''}
                          variant="pill"
                          onFocus={() => setActiveStep(3)}
                          {...field}
                          onBlur={() => setActiveStep(5)}
                        />
                      )}
                    />
                  </div>
                  {errors.customReleaseFrequencyNumber || errors.customReleaseFrequencyOption ? (
                    <div className="text-red-700 text-xs mt-3">Please select and enter custom frequency</div>
                  ) : null}
                </>
              ) : null}
            </StepLabel>

            <hr className="mx-6" />

            {/* Step 5: Amount to be vested section */}
            <StepLabel
              step={5}
              ref={step[4].ref}
              isExpanded={step[4].isExpanded}
              isActive={step[4].active}
              label="Amount to be vested"
              required
              description={
                <>
                  Select the total amount of tokens to be locked up in this schedule. If you have added multiple users,
                  note that this amount will be equally split between each user. Your current available supply is{' '}
                  <strong>{formatNumber(totalTokenSupply)}</strong> <strong>{mintFormState.symbol}</strong>.
                </>
              }
              hint={
                <>
                  An example is if you have added 3 users in the previous step and the total amount to be vested is
                  600,000 <strong>{mintFormState.symbol}</strong>, then each user will be allocated 200,000{' '}
                  <strong>{mintFormState.symbol}</strong>.
                </>
              }
              onFocus={() => setActiveStep(4)}>
              <div className="relative">
                {/* Step 5 Input field for the amount to be vested */}
                <Controller
                  name="amountToBeVestedText"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        max={totalTokenSupply}
                        error={Boolean(errors.amountToBeVestedText) || amountToBeVested.value > totalTokenSupply}
                        message={errors.amountToBeVestedText ? 'Please enter amount to be vested' : ''}
                        onFocus={() => setActiveStep(4)}
                        {...field}
                        onBlur={() => setActiveStep(5)}
                      />
                    </>
                  )}
                />
                <Chip
                  label="MAX"
                  color={amountToBeVested.value < totalTokenSupply ? 'secondary' : 'default'}
                  onClick={handleMaxAmount}
                  onBlur={() => setActiveStep(5)}
                  className={`absolute right-6 cursor-pointer ${
                    amountToBeVested.value > totalTokenSupply || errors.amountToBeVestedText ? 'bottom-9' : 'bottom-2'
                  }`}
                />
              </div>
              {/* Step 5 Slider section */}
              <div className="mt-6">
                <RangeSlider
                  max={totalTokenSupply || 0}
                  value={amountToBeVested.value ? amountToBeVested.value : 0}
                  className="mt-5"
                  onChange={handleAmountToBeVestedChange}
                  onBlur={() => setActiveStep(5)}
                />
              </div>
            </StepLabel>

            <hr className="mx-6" />
            <div className="px-6 pt-6">
              {/* Convert to component later */}
              <Checkbox
                label="Save as template"
                checked={saveAsTemplate.value}
                name="save-as-template"
                onChange={() => fuSetValue('saveAsTemplate', !saveAsTemplate.value)}
              />
              {saveAsTemplate.value ? (
                <Controller
                  name="templateName"
                  control={fuControl}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Template name"
                      placeholder="Enter template name"
                      className="mt-3"
                      error={Boolean(fieldState.error)}
                      message={fieldState.error ? 'Please enter template name' : ''}
                      {...field}
                    />
                  )}
                />
              ) : null}
            </div>

            <div className="flex flex-row justify-between items-center p-6">
              <BackButton
                label="Return to add recipients"
                onClick={() => Router.push('/vesting-schedule/add-recipients')}
              />
              <Button className="primary" type="submit" loading={isSubmitting} disabled={formError}>
                Continue
              </Button>
            </div>
          </Form>
        </div>
        <div className="md:col-span-5">
          <div className="panel">
            <label className="font-medium text-base text-neutral-900 mb-3">Schedule details</label>
            <ScheduleDetails {...getValues()} token={mintFormState.symbol || 'Token'} layout="small" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ConfigureSchedule.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/add-recipients' }
  ];

  // Update these into a state coming from the context
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
  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={2}>
      {page}
    </SteppedLayout>
  );
};

export default ConfigureSchedule;
