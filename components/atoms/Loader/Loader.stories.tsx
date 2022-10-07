import Loader from '@components/atoms/Loader/Loader';
import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

/**
 * Refer to https://klendi.github.io/react-top-loading-bar/ for the LoadingBar component usage
 */

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/Loader',
  component: Loader,
  layout: 'center'
} as ComponentMeta<typeof Loader>;

export const Sample = () => {
  const [progress, setProgress] = useState(0);
  let timer: any;
  const startContinuousLoading = (timer: any) => {
    if (!timer) {
      timer = setInterval(() => {
        setProgress((previousProgress) => previousProgress + 10);
      }, 1000);
    }
  };

  return (
    <>
      <Loader progress={progress} color="primary" onComplete={() => setProgress(0)} />
      <button onClick={() => startContinuousLoading(timer)}>Start loading</button>
    </>
  );
};
