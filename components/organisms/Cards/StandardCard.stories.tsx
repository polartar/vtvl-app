import { PlusIcon } from '@components/atoms/Icons';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { is } from 'utils/guard';

import StandardCard from './StandardCard';

export default is<ComponentMeta<typeof StandardCard>>()({
  title: 'Components/StandardCard',
  component: StandardCard,
  argTypes: {
    icon: {
      table: {
        disabled: true
      }
    },
    className: {
      defaultValue: 'max-w-250',
      table: {
        disabled: true
      }
    },
    content: {
      defaultValue: 'BICO',
      control: 'text'
    },
    contentIcon: {
      table: {
        disabled: true
      }
    },
    contentType: {
      defaultValue: 'text',
      control: 'option',
      options: ['text', 'number']
    }
  }
});

const Template: ComponentStory<typeof StandardCard> = (props) => (
  <div className="text-gray-900">
    <StandardCard {...props}>Welcome to VTVL storybook</StandardCard>
  </div>
);

export const TokenCard = Template.bind({});
TokenCard.args = {
  title: 'Token Name',
  content: 'BICO',
  icon: <PlusIcon className="w-4 h-4" />
};

export const TotalSupplyCard = Template.bind({});
TotalSupplyCard.args = {
  title: 'Total granted',
  contentType: 'number',
  content: '1,000,000'
};
