import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import RangeSlider from './RangeSlider';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/FormControls/RangeSlider',
  component: RangeSlider
} as ComponentMeta<typeof RangeSlider>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof RangeSlider> = (args) => <RangeSlider {...args} />;

export const Usage = Template.bind({});
Usage.args = {
  max: 100,
  defaultValue: '25',
  onChange: (e) => {
    console.log('Changing', e.target.value);
  }
};
