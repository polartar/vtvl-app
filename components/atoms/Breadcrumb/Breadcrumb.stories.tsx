import Breadcrumb from '@components/atoms/Breadcrumb/Breadcrumb';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
  title: 'components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof Breadcrumb>;

const Template: ComponentStory<typeof Breadcrumb> = (args) => <Breadcrumb {...args} />;

export const BreadcrumbTemplate = Template.bind({});
BreadcrumbTemplate.args = {
  steps: [
    { title: 'Vesting schedule', route: 'vesting-schedule' },
    { title: 'Minting token', route: 'minting-token' }
  ]
};
