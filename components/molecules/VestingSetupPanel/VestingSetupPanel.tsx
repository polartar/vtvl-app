import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import { ArrowLeftIcon } from '@components/atoms/Icons';
import { ToggleButton } from '@components/atoms/ToggleButton';
import { Typography } from '@components/atoms/Typography/Typography';
import { useDashboardContext } from '@providers/dashboard.context';
import { useVestingContext } from '@providers/vesting.context';
import { useShallowState } from 'hooks/useShallowState';
import useToggle from 'hooks/useToggle';
import React, { useCallback, useEffect, useMemo } from 'react';
import Select, { OnChangeValue } from 'react-select';
import { IScheduleState } from 'types/vesting';
import { isBlankObject } from 'utils/regex';

export interface VestingSetupPanelProps {
  initialState: IScheduleState;
  onReturn: () => void;
  onContinue: (form: {
    scheduleName: string;
    contractName: string;
    createNewContract: boolean;
    vestingContractId: string;
  }) => void;
}

export type VestingContractOption = {
  label: string;
  value: string;
};

const ERROR_EMPTY_STATE = {
  scheduleName: '',
  contractName: '',
  vestingContract: ''
};

export const VestingSetupPanel: React.FC<VestingSetupPanelProps> = ({ initialState, onReturn, onContinue }) => {
  const { vestingContracts } = useDashboardContext();
  const { scheduleMode } = useVestingContext();

  const [form, setForm] = useShallowState({
    scheduleName: '',
    contractName: '',
    createNewContract: true,
    vestingContract: { label: '', value: '' }
  });

  const [errors, setErrors] = useShallowState(ERROR_EMPTY_STATE);

  const vestingContractOptions = useMemo(
    () =>
      vestingContracts?.map(
        (contract) =>
          ({
            label: contract.data.name ?? contract.data.address,
            value: contract.id
          } as VestingContractOption)
      ) ?? [],
    [vestingContracts]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ [event.target.name]: event.target.value });
  }, []);

  const handleContinue = useCallback(() => {
    const newErrors = { ...ERROR_EMPTY_STATE };
    if (!form.scheduleName) {
      newErrors.scheduleName = 'This is a required field.';
    }

    if (form.createNewContract && !form.contractName) {
      newErrors.contractName = 'This is a required field.';
    }

    if (!form.createNewContract && !form.vestingContract.value) {
      newErrors.vestingContract = 'This is a required field.';
    }

    setErrors(newErrors);
    if (!isBlankObject(newErrors)) {
      return;
    }

    onContinue?.({
      scheduleName: form.scheduleName,
      contractName: form.contractName,
      createNewContract: form.createNewContract,
      vestingContractId: form.vestingContract.value
    });
  }, [form, onContinue]);

  const handleToggle = useCallback(() => {
    if (form.createNewContract && vestingContractOptions.length === 1) {
      setForm(({ createNewContract }) => ({
        createNewContract: !createNewContract,
        vestingContract: vestingContractOptions[0]
      }));
    } else setForm(({ createNewContract }) => ({ createNewContract: !createNewContract }));
  }, [form]);

  const handleChangeVesting = useCallback(
    (vestingContract: OnChangeValue<VestingContractOption, false>) => {
      setForm({ vestingContract: vestingContract as VestingContractOption, contractName: vestingContract?.label });
    },
    [vestingContractOptions]
  );

  useEffect(() => {
    const selectedVestingContract = vestingContractOptions?.find(
      (option) => option.value === initialState?.vestingContractId
    ) ?? {
      label: '',
      value: ''
    };
    setForm({
      scheduleName: initialState?.name ?? '',
      contractName: selectedVestingContract.label,
      createNewContract: initialState?.vestingContractId ? false : true,
      vestingContract: selectedVestingContract
    });
  }, [vestingContractOptions, initialState]);

  return (
    <div className="w-full mb-6 panel max-w-2xl">
      <div className="mb-6">
        <Typography className="font-semibold" size="subtitle">
          {scheduleMode && scheduleMode.edit ? 'Update' : 'Create'} Schedule &amp; Contract
        </Typography>
      </div>

      <VestingSetupStep
        step={1}
        title="Schedule name"
        description="Naming your schedule will help you determine your recipients collection."
        required>
        <Input
          name="scheduleName"
          value={form.scheduleName}
          placeholder="Marketing Team Q1 Schedule"
          error={!!errors.scheduleName}
          message={errors.scheduleName}
          onChange={handleChange}
        />
      </VestingSetupStep>

      <VestingSetupStep
        step={2}
        title="Will this schedule include a previously added wallet address?"
        description="A wallet address can only be used once in a single vesting contract, regardless of schedule."
        required>
        <>
          <div className="flex flex-col gap-4">
            <VestingSetupOption
              shortTitle="Yes"
              longTitle="Create a new contract"
              selected={form.createNewContract}
              onClick={handleToggle}
            />
            <VestingSetupOption
              shortTitle="No"
              longTitle="Select an existing contract"
              selected={!form.createNewContract}
              onClick={handleToggle}
            />
          </div>
        </>
      </VestingSetupStep>

      {form.createNewContract ? (
        <VestingSetupStep
          step={3}
          title="Contract name"
          description="Our vesting contract is built separately to the ERC-20 token contract for added security and flexibility."
          required>
          <Input
            name="contractName"
            value={form.contractName}
            placeholder="Marketing Team"
            error={!!errors.contractName}
            message={errors.contractName}
            onChange={handleChange}
          />
        </VestingSetupStep>
      ) : (
        <VestingSetupStep
          step={3}
          title="Contract name"
          description="Our vesting contract is built separately to the ERC-20 token contract for added security and flexibility."
          required>
          <>
            <Select options={vestingContractOptions} value={form.vestingContract} onChange={handleChangeVesting} />

            {errors.vestingContract && <p className="input-component__message">{errors.vestingContract}</p>}
          </>
        </VestingSetupStep>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 bg-transparent hover:bg-neutral-100"
          onClick={onReturn}>
          <ArrowLeftIcon className="w-6 h-6" />
          <Typography variant="inter" size="body">
            Return
          </Typography>
        </button>
        <Button type="button" outline primary onClick={handleContinue}>
          {scheduleMode && scheduleMode.edit ? 'Update' : 'Create'} schedule
        </Button>
      </div>
    </div>
  );
};

export const VestingSetupStep: React.FC<{
  step: number;
  title: string;
  description: string;
  required?: boolean;
  children: React.ReactElement;
}> = ({ step, title, description, required = false, children }) => {
  return (
    <div className="w-full py-6 border-b border-b-neutral-300">
      <div className="flex gap-3">
        <Typography
          className="font-bold rounded-full border-2 border-neutral-800 w-6 h-6 text-center"
          size="caption"
          variant="inter">
          {step}
        </Typography>
        <div className="w-full">
          <div className="flex flex-col mb-4">
            <label className={`${required && 'required'}`}>
              <Typography variant="inter" size="base" className="text-neutral-700 font-semibold">
                {title}
              </Typography>
            </label>
            <Typography variant="inter" size="body" className="text-[#344054]">
              {description}
            </Typography>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export const VestingSetupOption: React.FC<{
  shortTitle: string;
  longTitle: string;
  selected: boolean;
  onClick: () => void;
}> = ({ shortTitle, longTitle, selected, onClick }) => {
  return (
    <button
      className="px-6 py-4 rounded-3xl border border-neutral-300 text-left bg-transparent flex items-center justify-between"
      onClick={onClick}>
      <span>
        <Typography variant="inter" size="body" className="font-bold">
          {shortTitle}{' '}
        </Typography>
        <Typography variant="inter" size="body">
          - {longTitle}
        </Typography>
      </span>

      <ToggleButton value={selected} />
    </button>
  );
};
