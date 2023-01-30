import { ComponentMeta, ComponentStory } from '@storybook/react';
import { is } from 'utils/guard';

import { Typography } from './Typography';

export default is<ComponentMeta<typeof Typography>>()({
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    variant: {
      options: ['inter', 'sora'],
      defaultValue: 'inter'
    },
    size: {
      options: ['title', 'subtitle', 'paragraph', 'body', 'caption'],
      defaultValue: 'paragraph'
    },
    className: {
      table: {
        disabled: true
      }
    }
  }
});

const Template: ComponentStory<typeof Typography> = (props) => (
  <div className="text-gray-900">
    <Typography {...props}>Welcome to VTVL storybook</Typography>
  </div>
);

export const Title = Template.bind({});
Title.args = {
  variant: 'sora',
  size: 'title'
};

export const Subtitle = Template.bind({});
Subtitle.args = {
  variant: 'inter',
  size: 'subtitle'
};

export const Paragraph = Template.bind({});
Paragraph.args = {
  variant: 'inter',
  size: 'paragraph'
};

export const Base = Template.bind({});
Base.args = {
  variant: 'inter',
  size: 'base'
};

export const Caption = Template.bind({});
Caption.args = {
  variant: 'inter',
  size: 'caption'
};

export const Small = Template.bind({});
Small.args = {
  variant: 'inter',
  size: 'small'
};

export const ResponsiveText = Template.bind({});
ResponsiveText.args = {
  className: '!typography-base sm:typography-title'
};
