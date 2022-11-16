import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

import MinMaxInput from './MinMaxInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/FormControls/MinMaxInput',
  component: MinMaxInput
} as ComponentMeta<typeof MinMaxInput>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

export const Usage = () => {
  const [initial, setInitial] = useState(1);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(1);
  const handleMinChange = (e: any) => {
    console.log('Min changed', e.target.value);
    setInitial(e.target.value);
  };

  const handleMaxChange = (e: any) => {
    console.log('Max changed', e.target.value);
    setMax(e.target.value);
  };
  return (
    <MinMaxInput initial={initial} min={min} max={max} onMinChange={handleMinChange} onMaxChange={handleMaxChange} />
  );
};
