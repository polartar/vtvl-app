import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import axios from 'axios';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { fetchRecipient, updateRecipient } from 'services/db/recipient';
import { IRecipient, IRecipientDoc } from 'types/models';
import { IUserType } from 'types/models/member';
import { WEBSITE_NAME } from 'utils/constants';

const RecipientCreate: NextPage = () => {
  const { setOrganizationId, loading, setRecipient: setCurrentRecipient, signUpWithToken } = useAuthContext();
  const {
    website: { name: websiteName, assets }
  } = useGlobalContext();

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

  // Works as a debounce
  let timeout: NodeJS.Timeout;

  const initializeTokenVerification = () => {
    timeout = setTimeout(() => {
      // startOnboarding(Step.ChainSetup);
      const encryptToken = router.query.token;

      if (encryptToken) {
        axios
          .post('/api/token/getCustomToken', {
            encryptToken: encryptToken
          })
          .then((res) => {
            setToken(res.data.token);
            fetchRecipient(res.data.memberId).then((response) => {
              setRecipient({ id: res.data.memberId, data: response as IRecipient });

              if (response) updateRecipient(res.data.memberId, { status: 'accepted' });

              if (response?.name) {
                setValue('name', response?.name);
              }
              if (res?.data.orgName) {
                setValue('projectName', res?.data.orgName);
              }
              if (response?.email) {
                setValue('companyEmail', response.email);
              }
            });
          })
          .catch(async (err) => {
            if (err.response.data.message === 'jwt expired') {
              router.push({ pathname: '/expired', query: { loginToken: token } });
            } else {
              await toast.error('The token is invalid');
            }
          });
      }
    }, 300);
  };

  // Debounce the initialization of token verification
  // Ensures that this will only run once per router update
  useEffect(() => {
    initializeTokenVerification();
    return () => clearTimeout(timeout);
  }, [router]);

  const onSubmit = async () => {
    if (recipient?.id && token) {
      const newRecipient = {
        ...recipient?.data,

        org_id: recipient.data.organizationId,
        type: 'investor' as IUserType
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
        <Typography size="title" variant="sora" className="font-medium text-neutral-900">
          Hey there, Welcome to {websiteName || WEBSITE_NAME}
        </Typography>
        <p className="text-sm text-neutral-500">Confirm your account details</p>
      </div>
      <div className="panel  text-left">
        <Typography variant="inter" size="title" className="font-semibold">
          {recipient?.data.name}
        </Typography>
        <div className="flex items-center gap-3">
          <Image
            src={assets?.logoIcon?.src || '/icons/vtvl-icon.svg'}
            alt="company-logo"
            width={32}
            height={32}
            className=""
          />
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
                <Input
                  label="Project Name"
                  placeholder="Project Name"
                  error={Boolean(errors.projectName)}
                  {...field}
                  disabled
                />
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
