import DropDownInput from '@components/atoms/FormControls/DropDownInput/DropDownInput';
import Input from '@components/atoms/FormControls/Input/Input';
import { ToggleButton } from '@components/atoms/ToggleButton';
import { Typography } from '@components/atoms/Typography/Typography';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { NumericFormat } from 'react-number-format';
import { EMilestoneFreq, EMilestoneType, IMilestoneError, IMilestoneInput } from 'types/milestone';
import * as Yup from 'yup';

import ReleaseSelect from './ReleaseSelect';

const options = [
  {
    label: 'Year(s)',
    value: 'year'
  },
  {
    label: 'Month(s)',
    value: 'month'
  }
];

const releaseOptions = [
  {
    label: 'Yearly',
    value: EMilestoneFreq.YEARLY
  },
  {
    label: 'Monthly',
    value: EMilestoneFreq.MONTHLY
  },
  {
    label: 'Weekly',
    value: EMilestoneFreq.WEEKLY
  }
];
const defaultMilestone: IMilestoneInput = {
  title: '',

  description: '',
  allocation: '0',
  duration: { type: 'year', value: 1 },
  releaseFreq: EMilestoneFreq.MONTHLY
};

const MilestoneConfigure = ({
  initialMilestones,
  errors,
  setFormMilestones,
  setMilestoneType,
  clearError
}: {
  initialMilestones: IMilestoneInput[];
  errors: IMilestoneError[];
  setFormMilestones: (v: any) => void;
  setMilestoneType: (v: EMilestoneType) => void;
  clearError: (index: number, key: string) => void;
}) => {
  const [type, setType] = useState(EMilestoneType.SIMPLE);
  const [isSameDuration, setIsSameDuration] = useState(false);
  const addMoreMember = () => {
    if (isSameDuration) {
      const milestoneValues = getValues('milestones');
      append({
        ...defaultMilestone,
        allocation: getAvailablePercent(),
        duration: milestoneValues[0].duration,
        releaseFreq: milestoneValues[0].releaseFreq
      });
    } else {
      append({ ...defaultMilestone, allocation: getAvailablePercent() });
    }
  };

  const validationSchema = Yup.object()
    .strict(false)
    .shape({
      members: Yup.array(
        Yup.object().shape({
          title: Yup.string().required('Milestone title is required'),
          allocation: Yup.number().required('Milestone allocation is required'),
          description: Yup.string(),
          releaseFreq: Yup.string(),
          duration: Yup.object().shape({
            type: Yup.string(),
            value: Yup.number()
          })
        })
      )
    });

  const { control, handleSubmit, getValues, watch, register } = useForm({
    defaultValues: { milestones: initialMilestones },
    resolver: yupResolver(validationSchema)
  });

  const formValues = watch('milestones');
  // setFormMilestones(watch('milestones'));

  const { fields, append, remove } = useFieldArray({
    control,
    name: `milestones`
  });

  useEffect(() => {
    setMilestoneType(type);
  }, [type]);

  useEffect(() => {
    setFormMilestones(formValues);
  }, [JSON.stringify(formValues)]);

  // const getMaxPercent = (index: number) => {
  //   const milestoneValues = getValues('milestones');
  //   const totalPercent = milestoneValues.reduce(
  //     (total: number, item: IMilestoneInput) => total + getFloatValue(item.allocation),
  //     0
  //   );
  //   return totalPercent - getFloatValue(milestoneValues[index].allocation);
  // };

  const getFloatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value;
    }
    return Number(value.split('%')[0]);
  };

  const getAvailablePercent = () => {
    const milestoneValues = getValues('milestones');
    const totalPercent = milestoneValues.reduce(
      (total: number, item: IMilestoneInput) => total + getFloatValue(item.allocation),
      0
    );
    return (100 - totalPercent > 0 ? 100 - totalPercent : 0).toString();
  };

  return (
    <div className="">
      <div className="flex justify-between">
        <div
          className="border border-gray-300 rounded-lg p-5 min-w-250 flex items-center cursor-pointer "
          onClick={() => setType(EMilestoneType.SIMPLE)}>
          <label
            className={`mr-3 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border border-primary-900 overflow-hidden flex-shrink-0 ${
              type === EMilestoneType.SIMPLE ? 'bg-primary-900' : ' bg-primary-50'
            }`}>
            {type === EMilestoneType.SIMPLE ? <img src="/icons/check.svg" alt="simple" className="w-3 mt-px" /> : null}
            <input
              type="checkbox"
              name="agree"
              className="opacity-0 absolute top-10"
              defaultChecked={type === EMilestoneType.SIMPLE}
            />
          </label>
          <span className=" text-primary-700">Simple</span>
        </div>

        <div
          className="border border-gray-300 rounded-lg p-5 min-w-250 flex items-center cursor-pointer  "
          onClick={() => setType(EMilestoneType.VESTED)}>
          <label
            className={`mr-3  flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border border-primary-900 overflow-hidden flex-shrink-0 ${
              type === EMilestoneType.VESTED ? 'bg-primary-900' : ' bg-primary-50'
            }`}>
            {type === EMilestoneType.VESTED ? <img src="/icons/check.svg" alt="vested" className="w-3 mt-px" /> : null}
            <input
              type="checkbox"
              name="agree"
              className="opacity-0 absolute top-10"
              defaultChecked={type === EMilestoneType.VESTED}
            />
          </label>
          <span className=" text-primary-700">Vested</span>
        </div>
      </div>

      <div className="flex-row     my-5">
        {formValues.map((item, index) => {
          return (
            <Accordion
              title={`Milestone${index + 1}`}
              key={index}
              allocation={item.allocation}
              length={formValues.length}
              onRemove={() => index !== 0 && remove(index)}>
              <div className="flex flex-col gap-2">
                <Controller
                  name={`milestones.${index}.title`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label=""
                      placeholder="Milestone Title"
                      required
                      error={Boolean(errors && errors[index]?.title)}
                      message={errors && errors[index]?.title}
                      {...field}
                      onKeyDown={() => {
                        clearError(index, 'title');
                      }}
                    />
                  )}
                />

                <Controller
                  name={`milestones.${index}.description`}
                  control={control}
                  render={({ field }) => <Input label="" placeholder="Description (optional)" {...field} />}
                />

                <Controller
                  name={`milestones.${index}.allocation`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      innerLabel="Allocation"
                      type="percentLabel"
                      placeholder="100"
                      required
                      error={Boolean(errors && errors[index]?.allocation)}
                      message={errors && errors[index]?.allocation}
                      {...field}
                      onKeyDown={() => {
                        clearError(index, 'allocation');
                      }}
                    />
                  )}
                />

                {type === EMilestoneType.VESTED && (
                  <>
                    <div className="input-component__input flex justify-between">
                      <div>Duration</div>
                      <div className="flex w-full">
                        <Controller
                          name={`milestones.${index}.duration.value`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              value={field.value}
                              type="text"
                              thousandSeparator=","
                              decimalScale={6}
                              className="grow outline-none w-full outline-0 border-0 bg-transparent text-right mr-3"
                              isAllowed={(values) => {
                                const { formattedValue, floatValue } = values;
                                console.log('IS ALLOWED', formattedValue, floatValue);
                                return (
                                  formattedValue === '' || (floatValue ? floatValue >= 0 && floatValue <= 100 : false)
                                );
                              }}
                            />
                          )}
                        />

                        <Controller
                          name={`milestones.${index}.duration.type`}
                          control={control}
                          render={({ field }) => <DropDownInput {...field} options={options} value={field.value} />}
                        />
                      </div>
                    </div>

                    <div className="input-component__input flex justify-between">
                      <div>Release Freq</div>
                      <Controller
                        name={`milestones.${index}.releaseFreq`}
                        control={control}
                        render={({ field }) => (
                          <ReleaseSelect {...field} options={releaseOptions} value={field.value} index={index} />
                        )}
                      />
                    </div>
                    {index === 0 && (
                      <button
                        className="px-0 py-4   text-left  flex items-center justify-between"
                        onClick={() => setIsSameDuration(!isSameDuration)}>
                        <span>
                          <Typography variant="inter" size="body">
                            Same duration and release frequency for the rest of the milestone?
                          </Typography>
                        </span>

                        <ToggleButton value={isSameDuration} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </Accordion>
          );
        })}

        <div className="md:col-span-3 flex justify-start mt-2">
          <div className="py-1 text-secondary-900 cursor-pointer" onClick={handleSubmit(addMoreMember)}>
            {' '}
            + Add more milestones
          </div>
        </div>
      </div>
    </div>
  );
};

const Accordion = ({
  title,
  allocation,
  length,
  children,
  onRemove
}: {
  title: string;
  allocation: number | string;
  length: number;
  children: ReactElement;
  onRemove: () => void;
}) => {
  const [isExpand, setIsExpand] = useState(true);
  return (
    <div className="hs-accordion-group my-2">
      <div
        className="hs-accordion active  border -mt-px first:rounded-t-lg last:rounded-b-lg dark:bg-gray-800 dark:border-gray-700 bg-[#f2f4f7]"
        id="hs-bordered-heading-one">
        <button
          className=" justify-between hs-accordion-toggle hs-accordion-active:text-blue-600 inline-flex items-center gap-x-3 w-full font-semibold text-left text-primary-600 transition py-4 px-5 hover:text-primary-900 dark:hs-accordion-active:text-blue-500 dark:text-gray-200 dark:hover:text-gray-400"
          aria-controls="hs-basic-bordered-collapse-one"
          onClick={() => setIsExpand(!isExpand)}>
          <div className="flex">
            <svg
              data-accordion-icon
              className={`w-6 h-6 shrink-0 ${isExpand ? '' : 'rotate-[-90deg]'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"></path>
            </svg>

            {title}
          </div>
          <div className="flex items-center w-[94px]">
            <span className=" text-primary-400 text-sm">P: &nbsp; </span>
            <span className=" text-sm text-primary-600 m1-2">{allocation}%</span>
            {length !== 1 && (
              <img src="/images/close.svg" alt="onRemove" className=" cursor-pointer ml-3" onClick={() => onRemove()} />
            )}
          </div>
        </button>
        {isExpand && (
          <div
            id="hs-basic-bordered-collapse-one"
            className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300"
            aria-labelledby="hs-bordered-heading-one">
            <div className="py-4 px-5">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneConfigure;
