import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import StepLabel from '@components/atoms/FormControls/StepLabel/StepLabel';
import { ArrowLeftIcon } from '@components/atoms/Icons';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useWeb3React } from '@web3-react/core';
import { useShallowState } from 'hooks/useShallowState';
import { isAddress } from 'hooks/web3';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { createMilestoneTemplate } from 'services/db/milestoneTemplate';
import { EMilestoneFreq, EMilestoneType, ERROR_EMPTY_STATE, IMilestoneError, IMilestoneForm } from 'types/milestone';
import { isBlankObject } from 'utils/regex';
import { validateEmail } from 'utils/validator';

import MilestoneConfigure from './MilestoneConfigure';
import MilestoneSummary from './Summary';

const defaultMilestoneError = {
  allocation: '',
  title: ''
};
export interface MilestoneConfigureProps {
  onReturn: () => void;
  onContinue: (data: any) => void;
}
export const MilestoneConfigureSchedule: React.FC<MilestoneConfigureProps> = ({ onReturn, onContinue }) => {
  const { chainId } = useWeb3React();
  const { organizationId } = useAuthContext();
  const [form, setForm] = useShallowState<IMilestoneForm>({
    organizationId,
    chainId,
    recipientName: '',
    recipientEmail: '',
    recipientAddress: '',
    allocation: '0',
    type: EMilestoneType.SIMPLE,
    template: '',
    milestones: [
      {
        title: '',
        description: '',
        allocation: '100',
        duration: { type: 'year', value: 1 },
        releaseFreq: EMilestoneFreq.MONTHLY
      }
    ]
  });

  const [errors, setErrors] = useShallowState(ERROR_EMPTY_STATE);
  const [milestoneErrors, setMilestoneErrors] = useState<IMilestoneError[]>([defaultMilestoneError]);

  // useEffect(() => {
  //   if (form.milestones) {
  //     setMilestoneErrors([defaultMilestoneError]);
  //   }
  // }, [JSON.stringify(form.milestones)]);

  // const isCreateAvailable = useMemo(() => {
  //   if (!isBlankObject(errors)) {
  //     return true;
  //   }
  //   const newErrors = { ...ERROR_EMPTY_STATE };

  //   if (!form.allocation || !parseInt(form.allocation)) {
  //     newErrors.allocation = 'Please input the allocation';
  //   }
  //   if (!form.recipientAddress) {
  //     newErrors.recipientAddress = 'Please input the recipient address';
  //   }
  //   if (!form.recipientEmail) {
  //     newErrors.recipientEmail = 'Please input the recipient email';
  //   }
  //   if (!form.recipientName) {
  //     newErrors.recipientName = 'Please input the recipient name';
  //   }
  //   if (!form.template) {
  //     newErrors.template = 'Please input the template name';
  //   }

  //   let totalAllocation = 0;
  //   const newMilestoneErrors = form.milestones.map((milestone) => {
  //     const milestoneError = { ...defaultMilestoneError };
  //     if (!milestone.allocation) {
  //       milestoneError.allocation = 'Please input the allocation(%)';
  //     } else if (parseInt(milestone.allocation) === 0) {
  //       milestoneError.allocation = 'Allocation should be greater than 0';
  //     } else {
  //       totalAllocation += +milestone.allocation;
  //     }
  //     if (!milestone.title) {
  //       milestoneError.title = 'Please input the milestone title';
  //     }
  //     return milestoneError;
  //   });
  //   if (totalAllocation !== 100) {
  //     newMilestoneErrors[newMilestoneErrors.length - 1].allocation = 'Total allocation percent should be 100%';
  //   }

  //   setMilestoneErrors(newMilestoneErrors);

  //   if (!isBlankObject(newErrors) || newMilestoneErrors.some((error) => !isBlankObject(error))) {
  //     return true;
  //   }

  //   return false;
  // }, [form, errors]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.name === 'recipientEmail') {
        const validateResponse = validateEmail(event.target.value);

        if (!validateResponse.validated) {
          setErrors({ ...errors, recipientEmail: validateResponse.message });
        } else {
          setErrors({ ...errors, recipientEmail: '' });
        }
      } else if (event.target.name === 'recipientAddress') {
        if (!isAddress(event.target.value)) {
          setErrors({ ...errors, recipientAddress: 'Please input valid wallet address' });
        } else {
          setErrors({ ...errors, recipientAddress: '' });
        }
      } else if (event.target.name === 'allocation') {
        setErrors({ ...errors, allocation: '' });
      } else if (event.target.name === 'template') {
        setErrors({ ...errors, template: '' });
      } else if (event.target.name === 'recipientName') {
        setErrors({ ...errors, recipientName: '' });
      }

      setForm({ [event.target.name]: event.target.value });
    },
    [errors]
  );

  const handleContinue = async () => {
    const newErrors = { ...ERROR_EMPTY_STATE };

    if (!form.allocation || !parseInt(form.allocation)) {
      newErrors.allocation = 'Please input the allocation';
    }
    if (!form.recipientAddress) {
      newErrors.recipientAddress = 'Please input the recipient address';
    }
    if (!form.recipientEmail) {
      newErrors.recipientEmail = 'Please input the recipient email';
    }
    if (!form.recipientName) {
      newErrors.recipientName = 'Please input the recipient name';
    }
    if (!form.template) {
      newErrors.template = 'Please input the template name';
    }

    setErrors(newErrors);

    let totalAllocation = 0;
    const newMilestoneErrors = form.milestones.map((milestone) => {
      const milestoneError = { ...defaultMilestoneError };
      if (!milestone.allocation) {
        milestoneError.allocation = 'Please input the allocation(%)';
      } else if (parseInt(milestone.allocation) === 0) {
        milestoneError.allocation = 'Allocation should be greater than 0';
      } else {
        totalAllocation += +milestone.allocation;
      }
      if (!milestone.title) {
        milestoneError.title = 'Please input the milestone title';
      }
      return milestoneError;
    });
    if (totalAllocation !== 100) {
      newMilestoneErrors[newMilestoneErrors.length - 1].allocation = 'Total allocation percent should be 100%';
    }

    setMilestoneErrors(newMilestoneErrors);

    if (!isBlankObject(newErrors) || newMilestoneErrors.some((error) => !isBlankObject(error))) {
      return;
    }

    createTemplate();
    onContinue(form);
  };

  const [step, setStep] = useState<{ active: boolean; isExpanded: boolean; interactionCount: number; ref: any }[]>([
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) },
    { active: false, isExpanded: true, interactionCount: 0, ref: useRef<any>(null) }
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

  const createTemplate = async () => {
    try {
      if (organizationId && form.milestones.length > 0) {
        const option = {
          name: form.template,
          allocation: String(form.allocation),
          type: form.type,
          milestones: form.milestones,
          organizationId: organizationId
        };
        await createMilestoneTemplate(option);
      } else throw 'No organizationId';
    } catch (err) {
      // Something went wrong in creating a template
      toast.error('Oops! something went wrong');
    }
  };

  const clearMilestoneError = (index: number, key: string) => {
    const errors = milestoneErrors.map((error, i) => {
      if (i === index) {
        return {
          ...error,
          [key]: ''
        };
      }
      return error;
    });

    setMilestoneErrors(errors);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between w-full max-w-[1200px]">
      <div className="w-full mb-6 panel max-w-2xl p-0">
        <div className="p-6">
          <Typography className="font-semibold" size="subtitle">
            Setup schedule
          </Typography>
        </div>

        <StepLabel
          ref={step[0].ref}
          isExpanded={step[0].isExpanded}
          // isActive={step[0].active}
          step={1}
          label="Add recipient"
          description="For all recipients without a wallet address, please ensure an email address is provided."
          required
          onFocus={() => setActiveStep(0)}>
          <div className="flex gap-2 flex-col">
            <Input
              name="recipientName"
              value={form.recipientName}
              placeholder="Vitalik Armstrong"
              error={!!errors.recipientName}
              message={errors.recipientName}
              onChange={handleChange}
              onFocus={() => setActiveStep(0)}
            />
            <Input
              name="recipientEmail"
              value={form.recipientEmail}
              placeholder="v.armstrong@acme.com"
              error={!!errors.recipientEmail}
              message={errors.recipientEmail}
              onChange={handleChange}
              onFocus={() => setActiveStep(0)}
            />

            <Input
              name="recipientAddress"
              value={form.recipientAddress}
              placeholder="0x823....0CC5"
              error={!!errors.recipientAddress}
              message={errors.recipientAddress}
              onChange={handleChange}
              onFocus={() => setActiveStep(0)}
            />
            <Input
              name="allocation"
              type="number"
              value={form.allocation}
              placeholder="25,000"
              error={!!errors.allocation}
              message={errors.allocation}
              onChange={handleChange}
              onFocus={() => setActiveStep(0)}
            />
          </div>
        </StepLabel>
        <hr className="mx-6" />

        <StepLabel
          ref={step[1].ref}
          isExpanded={step[1].isExpanded}
          // isActive={step[1].active}
          step={2}
          label="Milestones"
          description="Determine how often recipients will receive their tokens over the course of their schedule."
          required
          onFocus={() => setActiveStep(1)}>
          <MilestoneConfigure
            initialMilestones={form.milestones}
            errors={milestoneErrors}
            clearError={(index: number, key: string) => clearMilestoneError(index, key)}
            setFormMilestones={(v) => setForm({ ...form, milestones: v })}
            setMilestoneType={(v) => setForm({ ...form, type: v })}
          />
        </StepLabel>

        <hr className="mx-6" />

        <StepLabel
          ref={step[2].ref}
          isExpanded={step[2].isExpanded}
          isActive={step[2].active}
          step={3}
          label="Save as template"
          required>
          <Input
            name="template"
            value={form.template}
            placeholder="eg. Marketing Template 01"
            error={!!errors.template}
            message={errors.template}
            onChange={handleChange}
            onFocus={() => setActiveStep(0)}
          />
        </StepLabel>

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
            Create schedule
          </Button>
        </div>
      </div>

      <div className="w-full max-w-lg panel items-center h-max" id="summary-parent">
        <MilestoneSummary form={form} />
      </div>
    </div>
  );
};
