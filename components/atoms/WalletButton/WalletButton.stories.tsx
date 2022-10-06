import MetaMaskSvg from '@assets/icons/wallets/metamask.svg';
import WalletConnectSvg from '@assets/icons/wallets/walletconnect.svg';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { WalletButton } from './WalletButton';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/WalletButton',
  component: WalletButton
} as ComponentMeta<typeof WalletButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof WalletButton> = (args) => <WalletButton {...args} />;

export const MetaMask = Template.bind({});
MetaMask.args = {
  image: MetaMaskSvg,
  label: 'MetaMask'
};

export const WalletConnect = Template.bind({});
WalletConnect.args = {
  image: WalletConnectSvg,
  label: 'Wallet Connect'
};
