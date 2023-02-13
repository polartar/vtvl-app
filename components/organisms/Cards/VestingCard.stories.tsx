import { ComponentMeta, ComponentStory } from '@storybook/react';
import { is } from 'utils/guard';

import VestingCard from './VestingCard';

export default is<ComponentMeta<typeof VestingCard>>()({
  title: 'Components/VestingCard',
  component: VestingCard,
  argTypes: {
    className: {
      defaultValue: '',
      table: {
        disabled: true
      }
    },
    title: {
      defaultValue: 'Voyager-0123',
      control: 'text'
    },
    percentage: {
      defaultValue: 55,
      control: 'number'
    },
    startDate: {
      defaultValue: '',
      control: 'text'
    },
    endDate: {
      defaultValue: '',
      control: 'text'
    },
    unlockDate: {
      defaultValue: '',
      control: 'text'
    },
    withdrawnAmount: {
      defaultValue: '',
      control: 'text'
    },
    unclaimedAmount: {
      defaultValue: '',
      control: 'text'
    },
    totalLockedAmount: {
      defaultValue: '',
      control: 'text'
    },
    disabled: {
      defaultValue: false,
      control: 'boolean'
    },
    buttonLabel: {
      defaultValue: 'Claim 205 BICO',
      control: 'text'
    },
    buttonAction: {
      table: {
        disabled: true
      }
    }
  }
});

const Template: ComponentStory<typeof VestingCard> = (props) => (
  <div className="w-368">
    <VestingCard {...props} />
  </div>
);

export const Vesting = Template.bind({});
Vesting.args = {
  title: 'Voyager-0123',
  percentage: 55,
  startDate: 'Aug 06, 2022 07:00 (GST) ',
  endDate: 'Nov 12, 2022 23:00 (GST) ',
  unlockDate: '0d 0h 0m 0s',
  withdrawnAmount: '0',
  unclaimedAmount: '205',
  totalLockedAmount: '15,000',
  disabled: false,
  buttonLabel: 'Claim 205 BICO'
};
