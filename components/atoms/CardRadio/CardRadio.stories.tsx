import EmployeeSvg from '@assets/images/onboarding-user-type-employee.svg';
import FounderSvg from '@assets/images/onboarding-user-type-founder.svg';
import InvestorSvg from '@assets/images/onboarding-user-type-investor.svg';
import CardRadio from '@components/atoms/CardRadio/CardRadio';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/CardRadio',
  component: CardRadio
} as ComponentMeta<typeof CardRadio>;

const options = [
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
];

export const Group = () => {
  const [selected, setSelected] = useState('');
  return (
    <div role="radiogroup" className="flex flex-row items-center justify-center gap-5">
      {options.map((option, optionIndex) => (
        <CardRadio
          key={`card-radio-${option.value}-${optionIndex}`}
          {...option}
          checked={selected === option.value}
          name="grouped-radio"
          onChange={() => setSelected(option.value)}
        />
      ))}
    </div>
  );
};
