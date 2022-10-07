import DefaultLayout from '@components/organisms/Layout/DefaultLayout';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'layouts/DefaultLayout',
  component: DefaultLayout,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof DefaultLayout>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DefaultLayout> = (args) => <DefaultLayout {...args} />;

export const Configuration = Template.bind({ sidebar: true });
