import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { NextPage } from 'next';
import Router from 'next/router';
import { useContext } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { emailPattern } from 'types/constants/validation-patterns';

type LoginForm = {
  userEmail: string;
  userPassword: string;
};

const LoginPage: NextPage = () => {
  const { signInWithEmail, signInWithGoogle, anonymousSignIn } = useContext(AuthContext);
  const { onNext, startOnboarding } = useContext(OnboardingContext);

  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitted, isSubmitting }
  } = useForm({
    defaultValues: {
      userEmail: '',
      userPassword: ''
    }
  });

  const userEmail = {
    value: watch('userEmail'),
    state: getFieldState('userEmail')
  };

  const userPassword = {
    value: watch('userPassword'),
    state: getFieldState('userPassword')
  };

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    const values = getValues();
    await signInWithEmail(values.userEmail, values.userPassword);
    Router.push('/dashboard');
  };

  const skipSignIn = async () => {
    await anonymousSignIn();
    Router.push('/dashboard');
  };

  const googleSignIn = async () => {
    const newLogin = await signInWithGoogle();
    if (newLogin?.isFirstLogin) startOnboarding(Step.SignUp);
    onNext({ userId: newLogin?.uuid, isFirstTimeUser: newLogin?.isFirstLogin });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl px-4">
      <h1 className="text-neutral-900">Welcome to VTVL</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae iaculis nulla.
      </p>
      <div className="w-full my-6 panel flex flex-col items-center">
        <button
          type="button"
          onClick={async () => await googleSignIn()}
          className="line flex flex-row items-center justify-center gap-2.5 w-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign in with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-1 my-5">
          <hr className="border-t border-neutral-200 w-full grow" />
          <span className="shrink-0 grow text-xs font-medium text-neutral-400">Or sign in with your email</span>
          <hr className="border-t border-neutral-200 w-full grow" />
        </div>
        <div className="w-full my-6">
          <Form isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="userEmail"
              control={control}
              rules={{ required: true, pattern: emailPattern }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  placeholder="Enter your company email address"
                  className="md:col-span-2"
                  error={Boolean(errors.userEmail)}
                  message={errors.userEmail ? 'Please enter your company email' : ''}
                  {...field}
                />
              )}
            />
            <Controller
              name="userPassword"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your password"
                  placeholder="Enter your password"
                  className="md:col-span-2"
                  type={'password'}
                  error={Boolean(errors.userPassword)}
                  message={errors.userPassword ? 'Please enter your password' : ''}
                  {...field}
                />
              )}
            />
            <Button className="secondary mt-5" type="submit" loading={isSubmitting}>
              Login
            </Button>
          </Form>
        </div>
        <button className="outlined mt-5" onClick={async () => await skipSignIn()}>
          Skip
        </button>
        <hr className="border-t border-neutral-200 w-full my-5" />
        <span className="font-medium text-xs text-neutral-800">
          Can&apos;t find your access code? <span className="text-primary-900">Send a new code</span>
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
