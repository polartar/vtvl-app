import useAuthAPI from '@api-hooks/useAuth';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import Consent from '@components/molecules/Consent/Consent';
import { REDIRECT_URIS } from '@utils/constants';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { emailPattern } from 'types/constants/validation-patterns';

/**
 * This is the registration page the uses the new API and updated flows
 */

type LoginForm = {
  memberEmail: string;
};

const RegisterPage = () => {
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

  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [isSignup, setIsSignup] = useState(false);

  const router = useRouter();

  const [agreedOnConsent, setAgreedOnConsent] = useState(false);

  const { signupWithEmail, getGoogleAuthCallback } = useAuthAPI();

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      setFormSuccess(false);
      const values = getValues();

      if (!agreedOnConsent) {
        setFormError(true);
        setFormMessage('You must accept the terms and conditions to create an account.');
        return;
      }

      await signupWithEmail({ email: values.memberEmail, redirectUri: REDIRECT_URIS.AUTH_EMAIL });
    } catch (error) {
      toast.error('Oh no! Something went wrong!');
      console.log(' invalid member signin ', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const redirect = await getGoogleAuthCallback({ redirectUri: REDIRECT_URIS.AUTH_GOOGLE_CALLBACK });
      console.log('REDIRECT FROM API', redirect);
      window.location.href = redirect;
    } catch (error) {
      console.log('Error getting google redirect', error);
    }
  };

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
          onClick={handleGoogleSignUp}
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
            <Consent variant="check" className="mt-5" onAgree={setAgreedOnConsent} />
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
              router.replace(REDIRECT_URIS.AUTH_LOGIN);
            }}>
            Login
          </button>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
