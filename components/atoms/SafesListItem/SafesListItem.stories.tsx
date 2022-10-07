import SafesListItem from '@components/atoms/SafesListItem/SafesListItem';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/SafesListItem',
  component: SafesListItem
} as ComponentMeta<typeof SafesListItem>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SafesListItem> = (args) => <SafesListItem {...args} />;

export const Usage = Template.bind({});
Usage.args = {
  label: '0x123ASFXasf125jkjhGjlkqwR13559123',
  onClick: () => alert('Import has been clicked!')
};
