import styled from '@emotion/styled';
import { NextPage } from 'next';
import React, {useContext} from 'react';
import OnboardingContext from 'providers/onboarding.context';
import CardRadio from '../../components/atoms/CardRadio/CardRadio';

const Container = styled.div`
  width: 100%;
  align-self: center;
  text-align: center;
`;

const userTypes = {
  options: [
    {
      image: '/images/onboarding-user-type-employee.svg',
      value: 'employee',
      label: "I'm an employee looking to check my assets"
    },
    {
      image: '/images/onboarding-user-type-founder.svg',
      value: 'founder',
      label: "I'm a founder who will setup the vesting schedule"
    },
    {
      image: '/images/onboarding-user-type-investor.svg',
      value: 'investor',
      label: "I'm an investor looking to check my assets"
    }
  ],
  name: 'userType'
};

const SelectUserTypePage: NextPage = () => {

  const { onCompleteStep } = useContext(OnboardingContext);
  const [selected, setSelected] = React.useState('');

  return (
    <Container>
      <h1>Tell us a little bit about yourself.</h1>
      <p className="text-sm">
        Select the options that best describe your role. Don&apos;t worry, you can explore other options later.
      </p>
      <div className="my-6">
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
      <button className="secondary" onClick={async () => { await onCompleteStep({accountType: selected});}}>
        Continue
      </button>
    </Container>
  );
};

export default SelectUserTypePage;
