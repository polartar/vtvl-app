import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { WalletConnect } from './WalletConnect';

export default {
  title: 'Components/WalletConnect',
  component: WalletConnect,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof WalletConnect>;

const Template: ComponentStory<typeof WalletConnect> = (args) => <WalletConnect {...args} />;

export const Connected = Template.bind({});
Connected.args = {
  connected: true
};

export const Disconnected = Template.bind({});
Disconnected.args = {
  connected: false
};
