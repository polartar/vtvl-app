import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import StepLabel from '@components/atoms/FormControls/StepLabel/StepLabel';
import { ArrowLeftIcon } from '@components/atoms/Icons';
import { ToggleButton } from '@components/atoms/ToggleButton';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useVestingContext } from '@providers/vesting.context';
import { useShallowState } from 'hooks/useShallowState';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const INITIAL_VESTING_CONTRACT: VestingContractOption = {
  label: '',
  value: '',
  safe: ''
};

export type VestingContractOption = {
  label: string;
  value: string;
  safe: string;
};

const ERROR_EMPTY_STATE = {
  scheduleName: '',
  contractName: '',
  vestingContract: ''
};

export const VestingSetupPanel: React.FC<VestingSetupPanelProps> = ({ initialState, onReturn, onContinue }) => {
  const { vestingContracts } = useDashboardContext();
  const { scheduleMode, isLinearVesting } = useVestingContext();
  const { currentSafe } = useAuthContext();

  const [form, setForm] = useShallowState({
    scheduleName: '',
    contractName: '',
    createNewContract: true,
    vestingContract: { ...INITIAL_VESTING_CONTRACT }
  });

  const [errors, setErrors] = useShallowState(ERROR_EMPTY_STATE);

  const vestingContractOptions = useMemo(
    () =>
      vestingContracts?.map(
        (contract) =>
          ({
            label: contract.name ?? contract.address,
            value: contract.id,
            safe: currentSafe?.safe_name || ''
          } as VestingContractOption)
      ) ?? [],
    [vestingContracts]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ [event.target.name]: event.target.value });
  }, []);

  const handleContinue = useCallback(() => {
    const newErrors = { ...ERROR_EMPTY_STATE };

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
      vestingContractId: form.createNewContract ? '' : form.vestingContract.value
    });
  }, [form, onContinue]);

  useEffect(() => {
    const selectedVestingContract = vestingContractOptions?.find(
      (option) => option.value === initialState?.vestingContractId
    ) ?? {
      label: '',
      value: '',
      safe: ''
    };
    setForm({
      scheduleName: initialState?.name ?? '',
      contractName: selectedVestingContract.label,
      createNewContract: initialState?.vestingContractId ? false : true,
      vestingContract: selectedVestingContract
    });
  }, [vestingContractOptions, initialState]);

  // Todo: Arvin - refactor this and make it a reusable feature across the app
  // This contains step section auto focusing during interaction
  // Contains 5 steps by default
  const [step, setStep] = useState<{ active: boolean; isExpanded: boolean; interactionCount: number; ref: any }[]>([
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) }
    // { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) }
  ]);

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

  return (
    <div className="w-full mb-6 panel max-w-2xl p-0">
      <div className="p-6">
        <Typography className="font-semibold" size="subtitle">
          {scheduleMode && scheduleMode.edit ? 'Update' : 'Create'} Contract
        </Typography>
      </div>

      <hr className="mx-6" />

      {form.createNewContract && (
        <StepLabel
          ref={step[1].ref}
          isExpanded={step[1].isExpanded}
          isActive={step[1].active}
          step={1}
          label="Contract name"
          description="Our vesting contract is built separately to the ERC-20 token contract for added security and flexibility."
          required>
          <Input
            name="contractName"
            value={form.contractName}
            placeholder="Marketing Team"
            error={!!errors.contractName}
            message={errors.contractName}
            onChange={handleChange}
            onFocus={() => setActiveStep(1)}
          />
        </StepLabel>
      )}

      <div className="p-6 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 bg-transparent hover:bg-neutral-100"
          onClick={onReturn}>
          <ArrowLeftIcon className="w-6 h-6" />
          <Typography variant="inter" size="body">
            Back
          </Typography>
        </button>
        <Button type="button" outline primary onClick={handleContinue}>
          {scheduleMode && scheduleMode.edit ? 'Update' : 'Create'} contract
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
  onFocus?: () => void;
}> = ({ shortTitle, longTitle, selected, onClick, onFocus }) => {
  return (
    <button
      className="px-6 py-4 rounded-full border border-neutral-300 text-left bg-neutral-50 flex items-center justify-between"
      onClick={onClick}
      onFocus={onFocus}>
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
