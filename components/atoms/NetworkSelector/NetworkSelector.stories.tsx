import NetworkSelector from '@components/atoms/NetworkSelector/NetworkSelector';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
  title: 'Components/NetworkSelector',
  component: NetworkSelector,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof NetworkSelector>;

export const NetworkSwitcher = () => {
  return <NetworkSelector />;
};
