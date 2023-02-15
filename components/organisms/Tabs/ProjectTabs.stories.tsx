import { ComponentMeta, ComponentStory } from '@storybook/react';
import { is } from 'utils/guard';

import ProjectTabsComponent from './ProjectTabs';

export default is<ComponentMeta<typeof ProjectTabsComponent>>()({
  title: 'Components/ProjectTabs',
  component: ProjectTabsComponent,
  argTypes: {
    className: {
      defaultValue: '',
      table: {
        disabled: true
      }
    },
    title: {
      defaultValue: 'Projects',
      control: 'text'
    },
    projects: {
      defaultValue: [],
      table: {
        disabled: true
      }
    },
    initialSelectedProject: {
      table: {
        disabled: true
      }
    }
  }
});

const Template: ComponentStory<typeof ProjectTabsComponent> = (props) => <ProjectTabsComponent {...props} />;

const MOCK_PROJECTS = [
  {
    label: 'Aave',
    value: 'aave'
  },
  {
    label: 'Avalanche',
    value: 'avalanche'
  },
  {
    label: 'Biconomy',
    value: 'biconomy'
  },
  {
    label: 'Binance',
    value: 'binance'
  },
  {
    label: 'Fantom',
    value: 'fantom'
  }
];

export const ProjectTabs = Template.bind({});
ProjectTabs.args = {
  title: 'Projects',
  projects: MOCK_PROJECTS,
  initialSelectedProject: MOCK_PROJECTS[0]
};
