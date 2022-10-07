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

export const MultipleImage = Template.bind({});
MultipleImage.args = {
  label: 'Banners',
  required: true,
  accept: 'image/*',
  multiple: true
};

export const OnForm = () => {
  const [mintTokenData, setMintTokenData] = useState({
    tokenLogo: []
  });

  const updateUploadedFiles = (files: any) => {
    setMintTokenData({ ...mintTokenData, tokenLogo: files });
    console.log('These are the files', files);
  };

  return (
    <form>
      <Uploader label="Token logo" required onFilesUpdate={updateUploadedFiles} />
      {mintTokenData.tokenLogo.length
        ? mintTokenData.tokenLogo.map((logo: File) => (
            <>
              <div>Filename: {logo.name}</div>
              <div>Filesize:{logo.size}</div>
            </>
          ))
        : null}
    </form>
  );
};
