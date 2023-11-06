import RecipientApiService from '@api-services/RecipientApiService';
import Button from '@components/atoms/Button/Button';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import useSafePush from '@hooks/useSafePush';
import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { IRecipient } from 'types/models';
import { WEBSITE_NAME } from 'utils/constants';

const RecipientCreate: NextPage = () => {
  const { setOrganizationId, setRecipient: setCurrentRecipient } = useAuthContext();
  const {
    website: { name: websiteName, assets }
  } = useGlobalContext();

  const router = useRouter();
  const { safePush } = useSafePush();
  const [recipient, setRecipient] = useState<IRecipient>();
  const [token, setToken] = useState('');
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
    const encryptToken = router.query.code;

    if (encryptToken) {
      RecipientApiService.getRecipientByCode(encryptToken as string)
        .then((response) => {
          setRecipient(response);
          setToken(encryptToken as string);
          if (response.name) {
            setValue('name', response?.name);
          }
          if (response.organization) {
            setValue('projectName', response.organization.name);
          }
          if (response.email) {
            setValue('companyEmail', response.email);
          }
        })
        .catch(async (err) => {
          // if (err.response.data.message === 'jwt expired') {
          //   safePush({ pathname: '/expired', query: { loginToken: token } });
          // } else {
          await toast.error('The token is invalid');
          // }
        });
      // axios
      //   .post('/api/token/getCustomToken', {
      //     encryptToken: encryptToken
      //   })
      //   .then((res) => {
      //     setToken(res.data.token);
      //     RecipientApiService.getRecipients(`id=${res.data.memberId}`).then(response => {
      //       setRecipient({ id: res.data.memberId, data: response as IRecipient });

      //       if (response) updateRecipient(res.data.memberId, { status: 'accepted' });

      //       if (response?.name) {
      //         setValue('name', response?.name);
      //       }
      //       if (res?.data.orgName) {
      //         setValue('projectName', res?.data.orgName);
      //       }
      //       if (response?.email) {
      //         setValue('companyEmail', response.email);
      //       }
      //     })
      //     fetchRecipient(res.data.memberId).then((response) => {
      //       setRecipient({ id: res.data.memberId, data: response as IRecipient });

      //       if (response) updateRecipient(res.data.memberId, { status: 'accepted' });

      //       if (response?.name) {
      //         setValue('name', response?.name);
      //       }
      //       if (res?.data.orgName) {
      //         setValue('projectName', res?.data.orgName);
      //       }
      //       if (response?.email) {
      //         setValue('companyEmail', response.email);
      //       }
      //     });
      //   })
      //   .catch(async (err) => {
      //     if (err.response.data.message === 'jwt expired') {
      //       safePush({ pathname: '/expired', query: { loginToken: token } });
      //     } else {
      //       await toast.error('The token is invalid');
      //     }
      //   });
    }
  }, [router]);

  const onSubmit = async () => {
    if (recipient?.id) {
      // const newRecipient = {
      //   ...recipient?.data,

      //   org_id: recipient.data.organizationId,
      //   type: 'investor' as IUserType
      // };

      // signUpWithToken(newRecipient, token);
      setCurrentRecipient(recipient);
      setOrganizationId(recipient?.organizationId);
      safePush('/recipient/confirm?code=' + token);
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
          {recipient?.name}
        </Typography>
        <div className="flex items-center gap-3">
          <Image
            src={assets?.logoIcon?.src || '/icons/vtvl-icon.svg'}
            alt="company-logo"
            width={32}
            height={32}
            className=""
          />
          <span>{recipient?.organization?.name}</span>
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
            <Button className="primary rounded-lg" type="submit" loading={isSubmitting}>
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipientCreate;
