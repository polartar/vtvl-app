import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { StepWizard } from './StepWizard';

export default {
  title: 'components/StepWizard',
  component: StepWizard
  // argTypes: {
  //   backgroundColor: { control: 'color' }
  // }
} as ComponentMeta<typeof StepWizard>;

const Template: ComponentStory<typeof StepWizard> = (args) => <StepWizard {...args} />;

export const StepOne = Template.bind({});
StepOne.args = {
  steps: [
    {
      title: 'Create Schedule',
      desc: 'Setup the dates and cliffs'
    },
    {
      title: 'Add Users',
      desc: 'Expand your reach'
    },
    {
      title: 'Schedule summary',
      desc: 'Get the latest details'
    }
  ],
  status: 0
};

export const StepTwo = Template.bind({});
StepTwo.args = {
  steps: [
    {
      title: 'Create Schedule',
      desc: 'Setup the dates and cliffs'
    },
    {
      title: 'Add Users',
      desc: 'Expand your reach'
    },
    {
      title: 'Schedule summary',
      desc: 'Get the latest details'
    }
  ],
  status: 1
};

export const StepThree = Template.bind({});
StepThree.args = {
  steps: [
    {
      title: 'Create Schedule',
      desc: 'Setup the dates and cliffs'
    },
    {
      title: 'Add Users',
      desc: 'Expand your reach'
    },
    {
      title: 'Schedule summary',
      desc: 'Get the latest details'
    }
  ],
  status: 2
};
