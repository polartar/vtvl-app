import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Input } from './Input';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/FormControls/Input',
  component: Input
} as ComponentMeta<typeof Input>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />;

export const Usage = Template.bind({});
Usage.args = {
  label: 'Organization name',
  required: true,
  placeholder: 'Enter organization name'
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  placeholder: 'Enter organization name'
};
