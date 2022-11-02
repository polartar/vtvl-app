import CardRadio from '@components/atoms/CardRadio/CardRadio';
import styled from '@emotion/styled';
import AuthContext from '@providers/auth.context';
import OnboardingContext, {Step} from '@providers/onboarding.context';
import { NextPage } from 'next';
import Router from 'next/router';
import React, { useContext, useEffect } from 'react';

const Container = styled.div`
  width: 100%;
  align-self: center;
  text-align: center;
`;

const userTypes = {
  options: [
    {
      image: '/images/onboarding-user-type-founder.svg',
      value: 'founder',
      label: (
        <>
          I'm a <span className="text-secondary-900">founder</span> of a web3 project
        </>
      )
    },
    {
      image: '/images/onboarding-user-type-investor.svg',
      value: 'investor',
      label: (
        <>
          I’m an <span className="text-secondary-900">employee / investor</span> looking to claim my tokens
        </>
      )
    }
  ],
  name: 'userType'
};

const SelectUserTypePage: NextPage = () => {
  const { onNext, startOnboarding } = useContext(OnboardingContext);
  const { emailSignUp } = useContext(AuthContext);
  const [selected, setSelected] = React.useState('');

  useEffect(() => {
    startOnboarding(Step.UserTypeSetup)
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email');
    if(email) loginWithUrl(email);
  }, [])

  const loginWithUrl = async (email: string) => {
    try {
      await emailSignUp(email, window.location.toString());
    } catch (error) {
      console.log("error ", error)
    }
  }

  return (
    <Container>
      <h1 className="text-neutral-900 mb-3">Tell us a little bit about yourself.</h1>
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
      <button
        className="secondary"
        onClick={async () => {
          if(selected === 'founder'){
            onNext({ accountType: selected });
            return;
          }
          Router.replace('/member');
        }}>
        Continue
      </button>
    </Container>
  );
};

export default SelectUserTypePage;
