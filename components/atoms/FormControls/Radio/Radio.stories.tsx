import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

import { Radio } from './Radio';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/FormControls/Radio',
  component: Radio
} as ComponentMeta<typeof Radio>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />;

let check = false;
export const DefaultRadio = Template.bind({});
DefaultRadio.args = {
  label: 'Organization name',
  required: true,
  placeholder: 'Enter organization name',
  name: 'organizationName',
  checked: check,
  onChange: () => {
    check = true;
  }
};

export const DefaultRadioWithDescription = Template.bind({});
DefaultRadioWithDescription.args = {
  label: 'Unlimited',
  required: true,
  description: 'No limit in the amount of tokens in circulation',
  placeholder: 'Enter organization name',
  name: 'organizationName',
  checked: check,
  onChange: () => {
    check = true;
  }
};

export const DefaultRadioNoLabel = Template.bind({});
DefaultRadioNoLabel.args = {
  placeholder: 'Enter organization name',
  name: 'organizationName',
  checked: check,
  onChange: () => {
    check = true;
  }
};

export const DefaultRadioGroup = () => {
  const [token, setToken] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <Radio
        label="Unlimited"
        description="No limit in the amount of tokens in circulation"
        name="tokens"
        value="unlimited"
        checked={token === 'unlimited'}
        onChange={() => setToken('unlimited')}
      />
      <Radio
        label="Limited"
        description="Fixed amount of tokens ever in circulation"
        name="tokens"
        value="limited"
        checked={token === 'limited'}
        onChange={() => setToken('limited')}
      />
    </div>
  );
};

export const InputStyleRadio = Template.bind({});
InputStyleRadio.args = {
  label: 'Organization name',
  required: true,
  name: 'organizationName',
  checked: check,
  onChange: () => {
    check = true;
  },
  placeholder: 'Enter organization name',
  variant: 'input-style'
};
