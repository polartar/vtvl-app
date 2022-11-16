import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/atoms/Toast',
  component: ToastContainer
} as ComponentMeta<typeof ToastContainer>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const notify = () => toast('Much easy! So wow!');

export const Sample = () => {
  return (
    <>
      <p className="mb-2">
        We are using{' '}
        <a href="https://fkhadra.github.io/react-toastify/introduction" target="_blank">
          react-toastify
        </a>
        . Check the link for the documentation on how to use
      </p>
      <button className="primary" onClick={notify}>
        Open toast
      </button>
      <ToastContainer className="app-toast" />
    </>
  );
};
