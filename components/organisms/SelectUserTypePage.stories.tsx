import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SelectUserTypePage } from './SelectUserTypePage';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'pages/onboarding/SelectUserType',
  component: SelectUserTypePage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof SelectUserTypePage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SelectUserTypePage> = (args) => <SelectUserTypePage />;

export const Page = Template.bind({});
