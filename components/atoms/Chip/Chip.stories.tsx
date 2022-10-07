import Chip from '@components/atoms/Chip/Chip';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/Chip',
  component: Chip
} as ComponentMeta<typeof Chip>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Chip> = (args) => <Chip {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  color: 'primary',
  label: 'Jane Doe'
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  label: 'Jane Doe'
};

export const Danger = Template.bind({});
Danger.args = {
  color: 'danger',
  label: 'Jane Doe'
};

export const Success = Template.bind({});
Success.args = {
  color: 'success',
  label: 'Jane Doe'
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  color: 'primary',
  label: 'John Doe'
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  color: 'default',
  label: 'John Doe'
};
