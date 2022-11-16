import Button from '@components/atoms/Button/Button';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import Form from '@components/atoms/FormControls/Form/Form';
import Uploader from '@components/atoms/Uploader/Uploader';
import CSVMapper from '@components/molecules/CSVMapper/CSVMapper';
import ImportStep from '@components/molecules/ImportStep/ImportStep';
import { ReactNode, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CommonLabelType, SelectOptions } from 'types/shared';

interface ICSVFlowStep {
  title: CommonLabelType;
  description: CommonLabelType;
  cancelButtonLabel?: CommonLabelType;
  confirmButtonLabel?: CommonLabelType;
}

interface ICSVFlowStep1 extends ICSVFlowStep {
  templateLabel: string;
  templateUrl: string;
}

interface ICSVFlowSteps {
  step1: ICSVFlowStep1;
  step2: ICSVFlowStep;
  step3: ICSVFlowStep;
}

interface IImportCSVFlowProps {
  steps: ICSVFlowSteps;
  fields: SelectOptions[];
  onFirstStep?: (data?: any) => void;
  onNextStep?: (data?: any) => void;
  onLastStep?: (data?: any) => void;
  onCancel?: (data?: any) => void;
  onComplete?: (data?: any) => void;
}

interface IMappedField {
  csvField: SelectOptions;
  vtvlField: SelectOptions;
}

interface IMappedFields {
  mappedFields: IMappedField[];
}

interface IFileName {
  fileName: string;
}

const ConditionalWrapper = ({ condition, wrapper, children }: any) =>
  condition ? wrapper(children) : <div className="panel">{children}</div>;

const ImportCSVFlow = ({
  onCancel = () => {},
  onComplete = () => {},
  onFirstStep = () => {},
  onNextStep = () => {},
  onLastStep = () => {},
  steps,
  fields,
  ...props
}: IImportCSVFlowProps) => {
  const [step, setStep] = useState<number>(1);
  const [csvHeaders, setCSVHeaders] = useState<SelectOptions[]>([]);
  const [csvData, setCSVData] = useState<Record<string, any>[]>([]);
  const [tableHeaders, setTableHeaders] = useState<SelectOptions[]>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [step1Error, setStep1Error] = useState(false);
  const [step1Success, setStep1Success] = useState(false);
  const [step1Message, setStep1Message] = useState('');
  const [step2Error, setStep2Error] = useState(false);
  const [step2Success, setStep2Success] = useState(false);
  const [step2Message, setStep2Message] = useState('');

  const defaultMappedValues: IMappedFields = {
    mappedFields: []
  };

  const defaultFileText: IFileName = {
    fileName: ''
  };

  /** Step 1 form controls */
  const {
    handleSubmit: step1Submit,
    setValue: step1SetValue,
    reset: step1Reset,
    formState: { isSubmitting: step1IsSubmitting }
  } = useForm({
    defaultValues: defaultFileText
  });

  /** Step 2 form controls */
  const {
    handleSubmit: step2Submit,
    setValue: step2SetValue,
    reset: step2Reset,
    formState: { isSubmitting: step2IsSubmitting }
  } = useForm({
    defaultValues: defaultMappedValues
  });

  /**
   * Whenever a value is changed in the CSVMapper component, this will trigger and save the data to our form.
   */
  const handleMapperChange = (data: any) => {
    console.log('Here is the data from the mapper', data);
    // setCSVMapData(data);
    step2SetValue('mappedFields', data);
    if (step2Error) {
      setStep2Error(false);
      setStep2Success(true);
      setStep2Message('Well done!');
    }
  };

  /**
   * After uploading the file, the uploader will read the contents and save the data to our form.
   */
  const uploadHandler = (data: any, fileName: any) => {
    // Gets the uploaded file's data
    console.log('Uploaded here', data, fileName);
    if (data.headers) setCSVHeaders(data.headers);
    if (data.data) setCSVData(data.data);
    if (fileName) step1SetValue('fileName', fileName);
    if (step1Error) {
      setStep1Error(false);
      setStep1Message(`File ${fileName} is selected`);
      setStep1Success(true);
    }
  };

  /**
   * Step 1 handlers
   * Should go to next step when confirmed.
   * Should trigger onCancel when cancelled.
   */
  const step1FormReset = () => {
    setStep1Error(false);
    setStep1Success(false);
    setStep1Message('');
  };

  const step1CancelButtonHandler = () => {
    // Clear any other data
    setStep(1);
    onCancel(false);
  };

  /**
   * This is now the handler for the step 1 confirmation button
   */
  const step1OnSubmit: SubmitHandler<IFileName> = (data) => {
    console.log('Step 1 submitted', data);
    step1FormReset();

    if (!data.fileName) {
      setStep1Error(true);
      setStep1Message('Please select a csv file first.');
      return;
    }
    // Apply the mapped values from csv to the step 2 form controls

    // Go to step 2
    if (onNextStep) onNextStep(data);
    setStep(2);
    step1Reset();
    return;
  };

  /**
   * Step 2 handlers
   * Cancelling will go back to the previous step.
   * Confirming will map all the data based on the columns they are assigned
   * - Validates if at least one has assigned column
   */
  const step2FormReset = () => {
    setStep2Error(false);
    setStep2Success(false);
    setStep2Message('');
  };

  const step2CancelButtonHandler = () => {
    setStep(1);
  };

  /**
   * This is now the handler for the step 2 confirmation button
   */
  const step2OnSubmit: SubmitHandler<IMappedFields> = (data) => {
    step2FormReset();
    // Validate if there is at least one mapped data
    console.log('Form Submitted', data, csvHeaders);
    const csvMapData = data.mappedFields;
    const validateData = csvMapData.filter((vdata: any) => vdata.csvField.value !== '');
    console.log('what!?', validateData);
    if (validateData.length < csvMapData.length) {
      setStep2Error(true);
      setStep2Message('Please match all the column headers.');
      return;
    }

    // Map out to the correct fields from Imported to VTVL fields
    const newHeading = validateData.map((heading) => {
      return {
        ...heading.vtvlField
      };
    });
    // Create a new set of data based on the new heading
    const newData = csvData.map((data) => {
      const newObject: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        const findMapDataField: any = csvMapData.find((mdata: any) => mdata.csvField.value === key);
        if (findMapDataField) {
          const newKey = findMapDataField.vtvlField.value;
          newObject[newKey] = value;
        }
      });
      return newObject;
    });
    console.log('New data', newHeading, newData);
    setTableHeaders(newHeading);
    setTableData(newData);
    setStep(3);

    setTimeout(() => {
      // step2Reset();
    }, 500);
  };

  /**
   * Step 3 handler
   * Cancelling will return to step 2 to map out or edit how the data is mapped out
   * Confirming will trigger the onComplete and passing the mapped out data to it
   * - Allows the parent component to control what to do with the data.
   */
  const step3CancelButtonHandler = () => {
    setStep(2);
  };

  const step3ConfirmButtonHandler = () => {
    // Save all data and map it to the current form as selected beneficiaries
    if (onComplete)
      onComplete({
        headers: tableHeaders,
        data: tableData
      });
    setStep(1);
    step1FormReset();
    step2FormReset();
    step1Reset();
    step2Reset();
  };

  const currentStep = () => {
    return steps[`step${step}` as keyof ICSVFlowSteps];
  };

  /**
   * Renders the content inside the ImportStep component based on the current step
   */
  const renderContents = () => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="mb-5 text-sm">
              Download:{' '}
              <a href={steps.step1.templateUrl} target="_blank" className="font-bold underline text-primary-900">
                {steps.step1.templateLabel}
              </a>
            </p>
            <Uploader accept=".csv" onUpload={uploadHandler} />
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-2">
              <label>
                <span>Data Type</span>
              </label>
              <label className="required">
                <span>Imported column header</span>
              </label>
            </div>
            <CSVMapper headers={csvHeaders} fields={fields} onChange={handleMapperChange} />
          </>
        );
      case 3:
        return (
          <div className="overflow-scroll w-full h-96">
            <table>
              <thead className="bg-neutral-50">
                {tableHeaders.map((heading, hIndex) => (
                  <th key={`heading-${hIndex}`} className="text-left text-xs font-medium py-1 px-3">
                    {heading.label}
                  </th>
                ))}
              </thead>
              <tbody>
                {tableData.map((record, rIndex) => (
                  <tr key={`data-${rIndex}`} className="border-t border-gray-200">
                    {tableHeaders.map((heading, hIndex) => (
                      <td key={`record-${rIndex}-${hIndex}}`} className="text-left text-sm p-3">
                        {record[heading.value]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <EmptyState title="Oops! Sorry, nothing here." />;
    }
  };

  /**
   * Renders all the action buttons inside the ImportStep component based on the current step.
   */
  const renderActions = () => {
    switch (step) {
      case 1:
        return (
          <>
            <button type="button" className="grow w-full line" onClick={step1CancelButtonHandler}>
              {currentStep().cancelButtonLabel || 'Cancel'}
            </button>
            <Button type="submit" className="grow w-full primary" loading={step1IsSubmitting}>
              {currentStep().confirmButtonLabel || 'Upload file'}
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <button type="button" className="grow w-full line" onClick={step2CancelButtonHandler}>
              {currentStep().cancelButtonLabel || 'Back'}
            </button>
            <Button type="submit" className="grow w-full primary" loading={step2IsSubmitting}>
              {currentStep().confirmButtonLabel || 'Continue'}
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <button type="button" className="grow w-full line" onClick={step3CancelButtonHandler}>
              {currentStep().cancelButtonLabel || 'Back'}
            </button>
            <button type="button" className="grow w-full primary" onClick={step3ConfirmButtonHandler}>
              {currentStep().confirmButtonLabel || 'Finish'}
            </button>
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      {steps ? (
        <ConditionalWrapper
          condition={step === 1 || step === 2}
          wrapper={(children: ReactNode) => (
            <Form
              isSubmitting={step === 1 ? step1IsSubmitting : step2IsSubmitting}
              error={step === 1 ? step1Error : step2Error}
              success={step === 1 ? step1Success : step2Success}
              message={step === 1 ? step1Message : step2Message}
              onSubmit={step === 1 ? step1Submit(step1OnSubmit) : step2Submit(step2OnSubmit)}>
              {children}
            </Form>
          )}>
          <ImportStep
            title={currentStep().title}
            step={step}
            steps={3}
            description={currentStep().description}
            content={renderContents()}
            actions={renderActions()}
          />
        </ConditionalWrapper>
      ) : null}
    </>
  );
};

export default ImportCSVFlow;
