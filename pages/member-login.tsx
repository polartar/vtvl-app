import Input from '@components/atoms/FormControls/Input/Input';
import AuthContext from '@providers/auth.context';
import OnboardingContext from '@providers/onboarding.context';
import { NextPage } from 'next';
import Router from 'next/router';
import { useContext } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { emailPattern } from 'types/constants/validation-patterns';

type LoginForm = {
  memberEmail: string;
};

const MemberLoginPage: NextPage = () => {
  const { teammateSignIn, signInWithGoogle } = useContext(AuthContext);
  const { onNext } = useContext(OnboardingContext);

  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitted }
  } = useForm({
    defaultValues: {
      memberEmail: ''
    }
  });

  const memberEmail = {
    value: watch('memberEmail'),
    state: getFieldState('memberEmail')
  };

  const googleSignIn = async () => {
    const newLogin = await signInWithGoogle();
    console.log('is this a new user???....', newLogin?.isFirstLogin);
    console.log('completing setup');
    await onNext({ userId: newLogin?.uuid, isFirstTimeUser: newLogin?.isFirstLogin });
  };

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    const values = getValues();
    await teammateSignIn(values.memberEmail, Router.locale || '');
    Router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Welcome to VTVL</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae iaculis nulla.
      </p>
      <div className="w-full my-6 panel flex flex-col items-center">
        <button
          onClick={async () => await googleSignIn()}
          className="line flex flex-row items-center justify-center gap-2.5 w-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign in with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-1 my-5">
          <hr className="border-t border-neutral-200 w-full grow" />
          <span className="shrink-0 grow text-xs font-medium text-neutral-400">Or signin with your email</span>
          <hr className="border-t border-neutral-200 w-full grow" />
        </div>
        <div className="w-full my-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="memberEmail"
              control={control}
              rules={{ required: true, pattern: emailPattern }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  placeholder="Enter your company email address"
                  className="md:col-span-2"
                  error={Boolean(errors.memberEmail)}
                  success={
                    !errors.memberEmail && (memberEmail.state.isTouched || memberEmail.state.isDirty) && isSubmitted
                  }
                  message={
                    errors.memberEmail
                      ? 'Please enter your company email'
                      : (memberEmail.state.isTouched || memberEmail.state.isDirty) && isSubmitted
                      ? 'Company email is okay'
                      : ''
                  }
                  {...field}
                />
              )}
            />
            <button className="secondary mt-5" type="submit">
              Login
            </button>
          </form>
        </div>
        <hr className="border-t border-neutral-200 w-full my-5" />
        <span className="font-medium text-xs text-neutral-800">
          Can&apos;t find your access code? <span className="text-primary-900">Send a new code</span>
        </span>
      </div>
    </div>
  );
};

export default MemberLoginPage;
