import { NextPage } from 'next';
import React from 'react';

import { Avatar } from '../../components/atoms/Avatar/Avatar';
import { BackButton } from '../../components/atoms/BackButton/BackButton';
import { Input } from '../../components/atoms/Input';
import { Radio } from '../../components/atoms/Radio';

const AccountSetupPage: NextPage = () => {
  const [accountInfo, setAccountInfo] = React.useState({
    name: '',
    company: '',
    type: 'organization',
    companyEmail: '',
    hash: '0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5'
  });

  const radioHandler = (e: any) => {
    setAccountInfo({ ...accountInfo, type: e.target.value });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your account</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae iaculis nulla. Etiam eget rhoncus orci, ac
        vestibulum justo.
      </p>
      <div className="w-full my-6 panel">
        <div className="flex flex-row items-center gap-3.5 pb-5 border-b border-neutral-200">
          <Avatar name="John Doe" size="large" placeholder="initials" />
          <div>
            <h2 className="h6 text-neutral-900">{accountInfo.name || 'Your name'}</h2>
            <p className="text-sm text-neutral-500">{accountInfo.company || 'Company name'}</p>
            <p className="text-sm text-neutral-600">{accountInfo.hash}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200">
          <Radio
            label="Organization"
            value="organization"
            name="type"
            checked={accountInfo.type === 'organization'}
            variant="input-style"
            onChange={radioHandler}
          />
          <Radio
            label="Individual"
            value="individual"
            name="type"
            checked={accountInfo.type === 'individual'}
            variant="input-style"
            onChange={radioHandler}
          />
          <Input label="Your name" placeholder="Enter your name" required />
          <Input label="Company name" placeholder="Enter your company name" required />
          <Input label="Your company email" placeholder="Enter your company email address" className="md:col-span-2" />
        </div>
        <div className="grid md:grid-cols-2 py-5 gap-5">
          <Input label="Contributor's name" placeholder="Enter contributor's name" required />
          <Input label="Contributor's email" placeholder="Enter contributor's email address" required />
        </div>
        <button className="secondary small mb-5">Add more contributors</button>
        <div className="flex flex-row justify-between items-center">
          <BackButton label="Return" href="/onboarding/select-user-type" />
          <button className="primary">Continue</button>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupPage;
