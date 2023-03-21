import CardRadio from '@components/atoms/CardRadio/CardRadio';
import { Typography } from '@components/atoms/Typography/Typography';
import styled from '@emotion/styled';
import AuthContext from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import OnboardingContext, { Step } from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { newMember } from 'services/db/member';
import { twMerge } from 'tailwind-merge';
import { IMember } from 'types/models';
import { IUserType } from 'types/models/member';

const Container = styled.div`
  width: 100%;
  align-self: center;
  text-align: center;
`;

const SelectUserTypePage: NextPage = () => {
  const { onNext, startOnboarding, completeOnboarding, inProgress } = useContext(OnboardingContext);
  const { emailSignUp, user } = useContext(AuthContext);
  const { active, account, chainId } = useWeb3React();
  const [selected, setSelected] = React.useState('');
  const [member, setMember] = React.useState<IMember>();
  const {
    website: { assets, organizationId: webOrgId }
  } = useGlobalContext();

  const userTypes = {
    options: [
      {
        image: {
          src: assets?.selectUserFounder?.src || '/images/onboarding-user-type-founder.svg',
          animated: assets?.selectUserFounder?.animated || false,
          animateOnHover: assets?.selectUserFounder?.animateOnHover || true
        },
        value: 'founder',
        label: (
          <>
            I'm a <span className={twMerge(webOrgId ? 'text-primary-900' : 'text-secondary-900')}>founder</span> of a
            web3 project
          </>
        )
      },
      {
        image: {
          src: assets?.selectUserRecipient?.src || '/images/onboarding-user-type-investor.svg',
          animated: assets?.selectUserRecipient?.animated || false,
          animateOnHover: assets?.selectUserRecipient?.animateOnHover || true
        },
        value: 'investor',
        label: (
          <>
            I’m a <span className={twMerge(webOrgId ? 'text-primary-900' : 'text-secondary-900')}>token recipient</span>{' '}
            looking to claim my tokens
          </>
        )
      }
    ],
    name: 'userType'
  };

  useEffect(() => {
    startOnboarding(Step.UserTypeSetup);
    const params: any = new URL(window.location.toString());
    const name = params.searchParams.get('name');
    const orgId = params.searchParams.get('orgId');
    const email = params.searchParams.get('email')?.replace(' ', '+');
    const newUser: boolean = params.searchParams.get('newUser');
    setMember({
      org_id: orgId,
      name,
      email,
      companyEmail: email
    });
    if (email)
      loginWithUrl(
        {
          org_id: orgId,
          name,
          email,
          companyEmail: email
        },
        newUser
      );
  }, []);

  const loginWithUrl = async (member: IMember, newUser: boolean) => {
    try {
      await emailSignUp(member, window.location.toString());
      if (!newUser) completeOnboarding();
    } catch (error) {
      console.log('error ', error);
    }
  };

  const handleContinue = async () => {
    try {
      if (selected === 'founder') {
        onNext({ accountType: selected });
        return;
      }
      if (user && account) {
        await newMember(user.uid, {
          email: user.email || member?.email,
          companyEmail: user.email || member?.email,
          name: user.displayName || member?.name,
          type: selected as IUserType,
          org_id: webOrgId || member?.org_id,
          wallets: [{ walletAddress: account, chainId: chainId! }]
        });
        Router.push('/welcome');
        return;
      }
      // invalid email sign up link
      toast.error('Invalid link please go to the sign up page and try again.');
    } catch (error) {
      console.log(error);
      toast.error('Oops something went wrong. Please go to the sign up page and try again.');
    }
  };

  return (
    <Container>
      <Typography size="title" variant="sora" className="font-medium text-neutral-900">
        Tell us a little bit about yourself.
      </Typography>
      <p className="text-sm text-neutral-500">Select the profile that best describes your role</p>
      <div className="mt-10 mb-6">
        <div role="radiogroup" className="flex flex-row items-center justify-center gap-5">
          {userTypes.options.map((option, optionIndex) => (
            <CardRadio
              key={`card-radio-${option.value}-${optionIndex}`}
              {...option}
              checked={selected === option.value}
              name="grouped-radio"
              onChange={() => setSelected(option.value)}
            />
          ))}
        </div>
      </div>
      <button className={twMerge(webOrgId ? 'primary' : 'secondary')} onClick={() => handleContinue()}>
        Continue
      </button>
    </Container>
  );
};

export default SelectUserTypePage;
