import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { FounderAccountSetupPage } from './FounderAccountSetupPage';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'pages/onboarding/FounderAccountSetup',
  component: FounderAccountSetupPage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof FounderAccountSetupPage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FounderAccountSetupPage> = (args) => <FounderAccountSetupPage />;

export const Page = Template.bind({});
