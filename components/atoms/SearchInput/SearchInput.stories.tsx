import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SearchInput } from './SearchInput';

export default {
  title: 'components/SearchInput',
  component: SearchInput,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof SearchInput>;

const Template: ComponentStory<typeof SearchInput> = (args) => <SearchInput {...args} />;

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  placeholder: 'large placeholder'
};

export const Medium = Template.bind({});
Medium.args = {
  size: 'medium',
  placeholder: 'medium placeholder'
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  placeholder: 'small size placeholder'
};
// export const Medium = () => <Input size='medium' placeholder='Medium size' />
// export const Large = () => <Input size='large' placeholder='Large size' />
