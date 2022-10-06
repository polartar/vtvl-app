import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SetupSafePage } from './SetupSafePage';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'pages/onboarding/SetupSafe',
  component: SetupSafePage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof SetupSafePage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SetupSafePage> = (args) => <SetupSafePage />;

export const Page = Template.bind({});
