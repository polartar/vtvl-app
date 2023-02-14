import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import { useAuthContext } from '@providers/auth.context';
import axios from 'axios';
import Lottie from 'lottie-react';
import { useRouter } from 'next/router';
import ErrorAnimation from 'public/error-state.json';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { emailPattern } from 'types/constants/validation-patterns';

const Expired = () => {
  const { loginToken } = useAuthContext();

  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onConfirm = async (data: any) => {
    if (loginToken) {
      try {
        const res = await axios.post('/api/email/resend-invite', {
          encryptToken: loginToken,
          email: data.email
        });
        if (res.data.message === 'Success!') {
          toast.success('We sent you invite email again');
        }
      } catch (err: any) {
        console.log(err);
        toast.error(err.response.data.message);
      }
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="sora font-semibold text-3xl text-neutral-900 mb-16">Link has expired</h1>
      <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />
      <p className="mt-11 text-lg text-neutral-500 text-center">
        Please confirm your email address.
        <br></br>
        If it matches our records, we'll send you a new link
      </p>
      <Form
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onConfirm)}
        className="w-full my-6 flex flex-col items-center text-center border-0">
        <Controller
          name="email"
          control={control}
          rules={{ required: true, pattern: emailPattern }}
          render={({ field }) => (
            <Input
              label=""
              placeholder="satoshi.s@vtvl.io"
              className="md:col-span-2"
              error={Boolean(errors.email)}
              required
              message={errors.email ? 'Please enter your company email' : ''}
              {...field}
            />
          )}
        />

        <Button type="submit" className="primary mt-5" loading={isSubmitting}>
          Confirm
        </Button>
      </Form>
    </div>
  );
};

export default Expired;
