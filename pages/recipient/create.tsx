import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import axios from 'axios';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { fetchRecipientByQuery, updateRecipient } from 'services/db/recipient';
import { IRecipientDoc } from 'types/models';

const RecipientCreate: NextPage = () => {
  const { setOrganizationId, loading, setRecipient: setCurrentRecipient, signUpWithToken } = useAuthContext();

  const router = useRouter();
  const [recipient, setRecipient] = useState<IRecipientDoc>();
  const [token, setToken] = useState();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      projectName: '',
      companyEmail: ''
    }
  });
  useEffect(() => {
    // startOnboarding(Step.ChainSetup);
    const encryptToken = router.query.token;

    if (encryptToken) {
      axios
        .post('/api/token/getCustomToken', {
          encryptToken: encryptToken
        })
        .then((res) => {
          setToken(res.data.token);
          fetchRecipientByQuery('email', '==', res.data.email).then((response) => {
            setRecipient(response);
            if (response) updateRecipient(response.id, { status: 'accepted' });

            if (response?.data.name) {
              setValue('name', response?.data.name);
            }
            if (res?.data.orgName) {
              setValue('projectName', res?.data.orgName);
            }
            if (response?.data.email) {
              setValue('companyEmail', response.data.email);
            }
          });
        })
        .catch(async (err) => {
          if (err.response.data.message === 'jwt expired') {
            router.push({ pathname: '/expired', query: { loginToken: token } });
          } else {
            await toast.error('The toke is invalid');
          }
        });
    }
  }, [router]);

  const onSubmit = async () => {
    if (recipient?.id && token) {
      const newRecipient = {
        ...recipient?.data,

        org_id: recipient.data.organizationId,
        type: 'investor'
      };

      signUpWithToken(newRecipient, token);
      setCurrentRecipient({
        id: recipient.id,
        data: newRecipient
      });
      setOrganizationId(newRecipient?.org_id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-5xl px-9 py-10 text-center">
      <div>
        <h1 className=" font-semibold mb-4">Hey there, welcome to VTVL</h1>
        <p className="text-sm text-neutral-500">Let's get to know you so you can start setting up your account</p>
      </div>
      <div className="panel  text-left">
        <Typography variant="inter" size="title" className="font-semibold">
          {recipient?.data.name}
        </Typography>
        <div className="flex items-center gap-3">
          <Image src={'/icons/company-logo.svg'} alt="company-logo" width={32} height={32} className="" />
          <span>{recipient?.data.company}</span>
        </div>
        <form className="w-full mb-6 border-0 border-t my-7" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-5 mb-5 mt-7 ">
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your name"
                  placeholder="Satoshi Saylor"
                  required
                  error={Boolean(errors.name)}
                  message={errors.name ? 'Please enter your name' : ''}
                  {...field}
                  disabled
                />
              )}
            />
            <Controller
              name="projectName"
              control={control}
              render={({ field }) => (
                <Input label="Project Name" placeholder="" error={Boolean(errors.projectName)} {...field} disabled />
              )}
            />
          </div>
          <div className="pb-5">
            <Controller
              name="companyEmail"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  required
                  placeholder="satoshi.s@acme.io"
                  type="email"
                  error={Boolean(errors.companyEmail)}
                  {...field}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-row justify-end items-center border-t pt-7">
            <Button className="primary rounded-lg" type="submit" loading={isSubmitting || loading}>
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipientCreate;
