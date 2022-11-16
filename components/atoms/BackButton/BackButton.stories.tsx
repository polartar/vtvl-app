import BackButton from '@components/atoms/BackButton/BackButton';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/BackButton',
  component: BackButton
} as ComponentMeta<typeof BackButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BackButton> = (args) => <BackButton {...args} />;

export const FormUsage = Template.bind({});
FormUsage.args = {
  onClick: () => {},
  label: 'Return to account setup'
};
