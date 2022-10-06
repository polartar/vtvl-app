import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { User } from './User';

export default {
  title: 'components/User',
  component: User,
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof User>;

const Template: ComponentStory<typeof User> = (args) => <User {...args} />;

export const UserTemplate = Template.bind({});
UserTemplate.args = {
  userName: 'John Doe',
  role: 'Founder'
};
