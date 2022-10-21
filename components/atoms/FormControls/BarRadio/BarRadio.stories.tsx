import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/FormControls/BarRadio',
  component: BarRadio
} as ComponentMeta<typeof BarRadio>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const radioOptions = [
  { label: 'Continuous', value: 'continuous' },
  { label: 'Minute', value: 'minute' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
];

export const Usage = () => {
  const [value, setValue] = useState();
  const handleChange = (e: any) => {
    setValue(e.target.value);
  };
  return (
    <>
      Value selected: {value}
      <BarRadio
        label="Release frequency"
        required
        name="sample"
        value={value}
        options={radioOptions}
        onChange={handleChange}
      />
    </>
  );
};
