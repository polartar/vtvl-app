import Button from '@components/atoms/Button/Button';
import { useAuthContext } from '@providers/auth.context';
import { Step, useOnboardingContext } from '@providers/onboarding.context';
import Lottie from 'lottie-react';
import { NextPage } from 'next';
import ErrorAnimation from 'public/error-state.json';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ErrorPage: NextPage = () => {
  const { startOnboarding } = useOnboardingContext();
  const { sendLoginLink } = useAuthContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startOnboarding(Step.ChainSetup);
    const params: any = new URL(window.location.toString());
    const userEmail = params.searchParams.get('email');
    if (userEmail) setEmail(userEmail);
  }, []);

  const sendMagicLink = async () => {
    try {
      if (!email) return;
      setLoading(true);
      await sendLoginLink(email);
      setLoading(false);
      toast.success('Please check your email for a one time link to login.');
    } catch (error) {
      console.error(error);
      toast.error('Error sending magic link please try again.');
    }
  };

  // To do:
  // Will update this into a dynamic component
  // where we can use this page if an error is thrown anywhere in the app,
  // Passing in the correct copies as well based on the error it received.
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="sora font-semibold text-3xl text-neutral-900 mb-16">Magic link expired</h1>
      <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />
      <p className="mt-11 text-lg text-neutral-500">Do you want us to send a new link to you at</p>
      <p className="text-lg font-bold text-neutral-900 mb-5">{email}</p>
      <Button loading={loading} onClick={() => sendMagicLink()} className="primary">
        Resend to my inbox
      </Button>
    </div>
  );
};

export default ErrorPage;
