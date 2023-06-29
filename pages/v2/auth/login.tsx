import useAuthAPI from '@api-hooks/useAuth';
import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import { REDIRECT_URIS } from '@utils/constants';
import { useRouter } from 'next/router';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { emailPattern } from 'types/constants/validation-patterns';

type LoginForm = {
  memberEmail: string;
};

const LoginPage = () => {
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

  const router = useRouter();

  const { loginWithEmail, getGoogleAuthCallback } = useAuthAPI();

  const onSubmit: SubmitHandler<LoginForm> = async () => {
    const values = getValues();
    try {
      await loginWithEmail({ email: values.memberEmail, redirectUri: REDIRECT_URIS.AUTH_EMAIL });
      return;
    } catch (error) {
      toast.error('Oh no! Something went wrong!');
      console.log(' invalid member signin ', error);
      return;
    }
  };

  const handleGoogleSignIn = async () => {
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
        Let's get started
      </Typography>
      <p className="text-sm text-center text-neutral-500 font-medium">Sign in to access the platform</p>

      <Form
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full my-6 flex flex-col items-center">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="line flex flex-row items-center justify-center gap-2.5 w-full rounded-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign in with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-3 my-6 w-full">
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
          <span className="block text-xs w-1/2 sm:w-1/3 font-medium text-center text-neutral-400">
            Or signin with your email
          </span>
          <hr className="border-t border-neutral-200 w-1/4 sm:w-1/3" />
        </div>
        <div className="w-full mb-6">
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
            <Button className="secondary mt-6" type="submit" loading={isSubmitting}>
              Login
            </Button>
          </div>
        </div>
        <hr className="border-t border-neutral-200 w-full mb-6" />
        <div className="flex flex-row items-center gap-5 justify-center font-medium text-xs text-neutral-800 text-center ">
          Don&apos;t have an account?{' '}
          <button type="button" className="primary small" onClick={() => router.replace(REDIRECT_URIS.AUTH_REGISTER)}>
            Create an account
          </button>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;
