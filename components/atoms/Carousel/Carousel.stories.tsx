import Carousel from '@components/atoms/Carousel/Carousel';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
  title: 'components/Carousel',
  component: Carousel,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1B369A' },
        { name: 'light', value: '#fff' }
      ]
    }
  }
} as ComponentMeta<typeof Carousel>;

const Template: ComponentStory<typeof Carousel> = (args) => <Carousel {...args} />;

const sampleItems = [
  {
    title: ['100% ', <strong>no-code</strong>, ' ready in minutes'],
    image: '/images/how-it-works/1.png',
    subtitle: 'Mint or bring your own token',
    description: 'Variable or fixed supply? No problem, you have options.'
  },
  {
    title: ['Create multiple ', <strong>vesting smart contracts</strong>, ' in just a few clicks'],
    image: '/images/how-it-works/2.png',
    subtitle: 'Generate smart contracts for investors & employees',
    description: 'We get it, have your engineers build YOUR product and let us take care of the custom vesting systems'
  },
  {
    title: ['Automate ', <strong>custom token</strong>, ' distributions to your holders'],
    image: '/images/how-it-works/3.png',
    subtitle: 'Track your own tokens',
    description: 'Say goodbye to managing via spreadsheet.'
  },
  {
    title: ['Token vesting analytics ', <strong>coming soon!</strong>],
    image: '/images/how-it-works/4.png',
    subtitle: 'Token analytics coming soon',
    description: 'What you really want to know about your tokenomics.'
  }
];

export const Dark = Template.bind({});
Dark.args = {
  items: sampleItems
};

export const Light = Template.bind({});
Light.args = {
  variant: 'light',
  items: sampleItems
};
