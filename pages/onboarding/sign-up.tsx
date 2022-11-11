import Input from '@components/atoms/FormControls/Input/Input';
import AuthContext from '@providers/auth.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { emailPattern } from 'types/constants/validation-patterns';

type LoginForm = {
  memberEmail: string;
};

const SignUpPage: NextPage = () => {
  const { teammateSignIn, sendLoginLink, signInWithGoogle } = useContext(AuthContext);
  const { onNext, startOnboarding } = useContext(OnboardingContext);
  const router = useRouter();

  useEffect(() => {
    startOnboarding(Step.SignUp);
  }, []);

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
    try {
      const newLogin = await signInWithGoogle();
      if (newLogin?.isFirstLogin) startOnboarding(Step.SignUp);
      onNext({ userId: newLogin?.uuid, isFirstTimeUser: newLogin?.isFirstLogin });
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    const values = getValues();
    try {
      const params: any = new URL(window.location.toString() || '');
      const type = params.searchParams.get('type');
      const orgId = params.searchParams.get('orgId');

      if (type && orgId) {
        // invited member
        await teammateSignIn(values.memberEmail, type, orgId, window.location.toString());
        router.push('/onboarding/member');
        return;
      }

      await sendLoginLink(values.memberEmail);
      toast.success('Please check your email for the link to login');
    } catch (error) {
      toast.error('Oh no! Something went wrong!');
      console.log(' invalid member signin ', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl">
      <h1 className="text-neutral-900">Sign Up</h1>
      <p className="text-sm text-center text-neutral-500">
        Select or enter your credentials to gain the access to platform.
        <br />
        Only registered team members are allowed to access this site.
      </p>

      <div className="w-full my-6 panel flex flex-col items-center">
        <button
          onClick={async () => await googleSignIn()}
          className="line flex flex-row items-center justify-center gap-2.5 w-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign Up with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-3 my-5 w-full">
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
          <span className="block text-xs w-1/2 sm:w-1/3 font-medium text-center text-neutral-400">
            Or sign up with your email
          </span>
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
        </div>
        <div className="w-full mb-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center">
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
                  required
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
              Sign Up
            </button>
          </form>
        </div>
        <hr className="border-t border-neutral-200 w-full mb-5" />
        <span className="font-medium text-xs text-neutral-800">
          Already have an account?{' '}
          <span className="text-primary-900" onClick={() => router.replace('/onboarding/member-login')}>
            Login
          </span>
        </span>
      </div>
    </div>
  );
};

export default SignUpPage;
