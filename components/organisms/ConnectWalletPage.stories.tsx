import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ConnectWalletPage } from './ConnectWalletPage';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'pages/onboarding/ConnectWallet',
  component: ConnectWalletPage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof ConnectWalletPage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ConnectWalletPage> = (args) => <ConnectWalletPage />;

export const Page = Template.bind({});
