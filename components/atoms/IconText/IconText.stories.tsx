import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { IconText } from './IconText';

export default {
  title: 'components/IconText',
  component: IconText,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof IconText>;

const Template: ComponentStory<typeof IconText> = (args) => <IconText {...args} />;

export const IconTextTemplate = Template.bind({});
IconTextTemplate.args = {
  children: 'Notifications'
};
