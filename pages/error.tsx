import Button from '@components/atoms/Button/Button';
import Lottie from 'lottie-react';
import { NextPage } from 'next';
import ErrorAnimation from 'public/error-state.json';

const ErrorPage: NextPage = () => {
  // To do:
  // Will update this into a dynamic component
  // where we can use this page if an error is thrown anywhere in the app,
  // Passing in the correct copies as well based on the error it received.
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="sora font-semibold text-3xl text-neutral-900 mb-16">Magic link expired</h1>
      <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />
      <p className="mt-11 text-lg text-neutral-500">Do you want us to send a new link to you at</p>
      <p className="text-lg font-bold text-neutral-900 mb-5">satoshi.s@vtvl.io</p>
      <Button className="primary">Resend to my inbox</Button>
    </div>
  );
};

export default ErrorPage;
