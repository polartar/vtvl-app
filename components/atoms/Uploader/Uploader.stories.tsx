import Uploader from '@components/atoms/Uploader/Uploader';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/Uploader',
  component: Uploader,
  layout: 'center'
} as ComponentMeta<typeof Uploader>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Uploader> = (args) => <Uploader {...args} />;

export const SingleImage = Template.bind({});
SingleImage.args = {
  label: 'Token logo',
  required: true,
  accept: 'image/*'
};

export const OnForm = () => {
  const [logoUrl, setLogoUrl] = useState('');

  const updateUploadedFiles = (url: string, fileName: string) => {
    console.log('File name is', fileName);
    setLogoUrl(url);
  };

  return (
    <form>
      <Uploader label="Token logo" required onUpload={updateUploadedFiles} />
      Uploaded: {logoUrl}
    </form>
  );
};
