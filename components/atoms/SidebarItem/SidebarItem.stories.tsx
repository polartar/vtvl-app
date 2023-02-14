import SidebarItem from '@components/atoms/SidebarItem/SidebarItem';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
  title: 'components/SidebarItem',
  component: SidebarItem,
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof SidebarItem>;

const Template: ComponentStory<typeof SidebarItem> = (args) => <SidebarItem {...args} />;

export const SelectedItem = Template.bind({});
SelectedItem.args = {
  selected: true,
  children: 'Vesting schedule'
};
