import FounderSvg from '@assets/images/onboarding-user-type-founder.svg';
import InvestorSvg from '@assets/images/onboarding-user-type-investor.svg';
import CardRadio from '@components/atoms/CardRadio/CardRadio';
import { DefaultLayout } from '@components/layout/DefaultLayout';
import styled from '@emotion/styled';
import React from 'react';

import EmployeeSvg from '../../assets/images/onboarding-user-type-employee.svg';

const userTypes = {
  options: [
    {
      image: EmployeeSvg,
      value: 'employee',
      label: "I'm an employee looking to check my assets"
    },
    {
      image: FounderSvg,
      value: 'founder',
      label: "I'm a founder who will setup the vesting schedule"
    },
    {
      image: InvestorSvg,
      value: 'investor',
      label: "I'm an investor looking to check my assets"
    }
  ],
  name: 'userType'
};

const Container = styled.div`
  width: 100%;
  align-self: center;
  text-align: center;
`;

export const SelectUserTypePage = () => {
  const [selected, setSelected] = React.useState('');
  return (
    <DefaultLayout>
      <Container>
        <h1>Tell us a little bit about yourself.</h1>
        <p className="text-sm">
          Select the options that best describe your role. Don't worry, you can explore other options later.
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
        <button className="secondary">Continue</button>
      </Container>
    </DefaultLayout>
  );
};
