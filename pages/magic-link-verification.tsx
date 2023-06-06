import Button from '@components/atoms/Button/Button';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import useMagicLinkSignIn from '@hooks/useMagicLinkSignIn';
import Lottie from 'lottie-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import ErrorAnimation from 'public/error-state.json';

// This page displays the loading state by default, and when the magic link is expired.
const MagicLinkVerificationPage: NextPage = () => {
  const { isExpired } = useMagicLinkSignIn();
  const router = useRouter();
  return isExpired ? (
    <div className="pt-12 flex flex-col items-center justify-center h-full">
      <h1 className="sora font-semibold text-3xl text-neutral-900 mb-16">Link has expired</h1>
      <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />
      <p className="mt-11 text-lg text-neutral-500 text-center">Please confirm your email address again.</p>
      <Button type="button" className="primary mt-5" onClick={() => router.push('/onboarding')}>
        Back to Home
      </Button>
    </div>
  ) : (
    <PageLoader />
  );
};

export default MagicLinkVerificationPage;
