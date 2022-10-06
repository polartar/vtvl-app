import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { PageTitle } from './PageTitle';

export default {
  title: 'components/PageTitle',
  component: PageTitle,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof PageTitle>;

const Template: ComponentStory<typeof PageTitle> = (args) => <PageTitle {...args} />;

export const PageTitleTemplate = Template.bind({});
PageTitleTemplate.args = {
  title: 'Configure schedule'
};
