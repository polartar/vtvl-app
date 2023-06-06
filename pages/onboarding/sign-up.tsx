import useAuth from '@api-hooks/useAuth';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import Consent from '@components/molecules/Consent/Consent';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { AUTH_REDIRECT_URI, USE_NEW_API } from '@utils/constants';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { fetchMemberByEmail } from 'services/db/member';
import { emailPattern } from 'types/constants/validation-patterns';

type LoginForm = {
  memberEmail: string;
};

const SignUpPage: NextPage = () => {
  const { teammateSignIn, sendLoginLink, signInWithGoogle, agreedOnConsent, setAgreedOnConsent, allowSignIn } =
    useContext(AuthContext);
  const { onNext, startOnboarding } = useContext(OnboardingContext);
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const { signupWithEmail } = useAuth();

  useEffect(() => {
    startOnboarding(Step.SignUp);
  }, []);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      memberEmail: ''
    }
  });

  const googleSignIn = async () => {
    try {
      setIsSignup(true);
      const newLogin = await signInWithGoogle();

      if (newLogin?.isFirstLogin) {
        startOnboarding(Step.SignUp);
      }
      onNext({ userId: newLogin?.uuid, isFirstTimeUser: newLogin?.isFirstLogin });
      setIsSignup(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onGoogleSignUp = async () => {
    if (!agreedOnConsent) {
      setFormError(true);
      setFormMessage('You must accept the terms and conditions to create an account.');
      return;
    }
    await googleSignIn();
  };

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      setFormSuccess(false);
      const values = getValues();
      const params: any = new URL(window.location.toString() || '');
      const type = params.searchParams.get('type');
      const orgId = params.searchParams.get('orgId');

      if (!agreedOnConsent) {
        setFormError(true);
        setFormMessage('You must accept the terms and conditions to create an account.');
        return;
      }

      if (type && orgId) {
        // invited member
        await teammateSignIn(values.memberEmail, type, orgId, window.location.toString());
        router.push('/onboarding/member');
        return;
      }

      if (USE_NEW_API) {
        await signupWithEmail({ email: values.memberEmail, redirectUri: AUTH_REDIRECT_URI });
      } else {
        await sendLoginLink(values.memberEmail);
      }
    } catch (error) {
      toast.error('Oh no! Something went wrong!');
      console.log(' invalid member signin ', error);
    }
  };

  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const handleAgree = (checked: boolean) => {
    setAgreedOnConsent(checked);
  };

  useEffect(() => {
    if (agreedOnConsent === true) {
      setFormError(false);
      setFormSuccess(true);
      setFormMessage('');
    }
  }, [agreedOnConsent]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl">
      <Typography size="title" variant="sora" className="font-medium text-neutral-900">
        Create your account
      </Typography>
      <p className="text-sm text-center text-neutral-500">Please enter your email to create an account</p>

      <Form
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        error={formError}
        success={formSuccess}
        message={formMessage}
        className="w-full my-6 flex flex-col items-center">
        <button
          type="button"
          onClick={onGoogleSignUp}
          className="line flex flex-row items-center justify-center gap-2.5 w-full rounded-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign up with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-3 my-5 w-full">
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
          <span className="block text-xs w-1/2 sm:w-1/3 font-medium text-center text-neutral-400">
            Or sign up with your email
          </span>
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
        </div>
        <div className="w-full mb-5">
          <div className="flex flex-col items-center">
            <Controller
              name="memberEmail"
              control={control}
              rules={{ required: true, pattern: emailPattern }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  placeholder="satoshi.s@vtvl.io"
                  className="md:col-span-2"
                  error={Boolean(errors.memberEmail)}
                  required
                  message={errors.memberEmail ? 'Please enter your company email' : ''}
                  {...field}
                />
              )}
            />
            <Consent variant="check" className="mt-5" onAgree={handleAgree} />
            <Button
              className="secondary mt-5 mx-auto"
              type="submit"
              loading={isSubmitting || isSignup}
              disabled={Boolean(errors.memberEmail) || !agreedOnConsent}>
              Create account
            </Button>
          </div>
        </div>
        <hr className="border-t border-neutral-200 w-full mb-5" />
        <div className="flex flex-row items-center justify-center gap-5 font-medium text-xs text-neutral-800">
          Already have an account?{' '}
          <button
            type="button"
            className="primary small"
            onClick={() => {
              setAgreedOnConsent(false);
              router.replace('/onboarding/member-login');
            }}>
            Login
          </button>
        </div>
      </Form>
    </div>
  );
};

export default SignUpPage;
