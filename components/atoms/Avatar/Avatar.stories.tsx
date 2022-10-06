import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Avatar } from './Avatar';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/Avatar',
  component: Avatar,
  layout: 'center'
} as ComponentMeta<typeof Avatar>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Avatar> = (args) => <Avatar {...args} />;

const src =
  'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

export const Usage = Template.bind({});
Usage.args = {
  name: 'John Doe',
  src
};

export const Small = Template.bind({});
Small.args = {
  name: 'John Doe',
  size: 'small',
  src
};

export const Default = Template.bind({});
Default.args = {
  name: 'John Doe',
  size: 'default',
  src
};

export const Large = Template.bind({});
Large.args = {
  name: 'John Doe',
  size: 'large',
  src
};

export const PlaceholderInitials = Template.bind({});
PlaceholderInitials.args = {
  name: 'John Doe',
  placeholder: 'initials'
};

export const PlaceholderIcon = Template.bind({});
PlaceholderIcon.args = {
  name: 'John Doe',
  placeholder: 'icon'
};
