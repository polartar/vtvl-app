import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import AuthContext from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import OnboardingContext, { States, Step } from '@providers/onboarding.context';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { VALIDATION_ERROR_MESSAGES, emailRegex } from 'utils/validator';

type LoginForm = {
  memberEmail: string;
};

const MemberLoginPage: NextPage = () => {
  const { teammateSignIn, sendLoginLink, signInWithGoogle, allowSignIn } = useContext(AuthContext);
  const { onNext, startOnboarding } = useContext(OnboardingContext);
  const {
    website: { features }
  } = useGlobalContext();
  const router = useRouter();

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
    const newLogin = await signInWithGoogle();
    if (newLogin) {
      if (newLogin?.isOnboarding) {
        startOnboarding(Step.UserTypeSetup);
      }
      onNext({ userId: newLogin?.uuid, isFirstTimeUser: newLogin?.isFirstLogin });
    }
  };

  const onSubmit: SubmitHandler<LoginForm> = async () => {
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
      return;
    } catch (error) {
      toast.error('Oh no! Something went wrong!');
      console.log(' invalid member signin ', error);
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl px-4">
      <Typography size="title" variant="sora" className="font-medium text-neutral-900">
        Let's get started
      </Typography>
      <p className="text-sm text-center text-neutral-500 font-medium">Sign in to access the platform</p>

      <Form
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full my-6 flex flex-col items-center">
        <button
          type="button"
          onClick={async () => await googleSignIn()}
          className="line flex flex-row items-center justify-center gap-2.5 w-full rounded-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign in with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-3 my-6 w-full">
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
          <span className="block text-xs w-1/2 sm:w-1/3 font-medium text-center text-neutral-400">
            Or sign in with your email
          </span>
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
        </div>
        <div className="w-full mb-6">
          <div className="flex flex-col items-center">
            <Controller
              name="memberEmail"
              control={control}
              rules={{ required: true, pattern: emailRegex }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  placeholder="satoshi.s@vtvl.io"
                  className="md:col-span-2"
                  error={Boolean(errors.memberEmail)}
                  required
                  message={
                    errors?.memberEmail?.type === 'pattern'
                      ? VALIDATION_ERROR_MESSAGES.EMAIL
                      : 'Please enter your company email'
                  }
                  {...field}
                />
              )}
            />
            <Button className="secondary mt-6" type="submit" loading={isSubmitting}>
              Login
            </Button>
          </div>
        </div>
        {!features?.auth?.memberOnly && (
          <>
            <hr className="border-t border-neutral-200 w-full mb-6" />
            <div className="flex flex-row items-center gap-5 justify-center font-medium text-xs text-neutral-800 text-center ">
              Don&apos;t have an account?{' '}
              <button type="button" className="primary small" onClick={() => router.replace('/onboarding/sign-up')}>
                Create an account
              </button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

export default MemberLoginPage;
