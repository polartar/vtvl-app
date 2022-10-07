import notificationsIcon from '@assets/notifications.svg';
import capTableIcon2 from '@assets/s_capTable2.svg';
import capTableIcon from '@assets/s_capTable.svg';
import dashboardIcon2 from '@assets/s_dashboard2.svg';
import dashboardIcon from '@assets/s_dashboard.svg';
import tokenPerformanceIcon2 from '@assets/s_tokenPerformance2.svg';
import tokenPerformanceIcon from '@assets/s_tokenPerformance.svg';
import tokenomicsIcon2 from '@assets/s_tokenomics2.svg';
import tokenomicsIcon from '@assets/s_tokenomics.svg';
import transactionsIcon2 from '@assets/s_transactions2.svg';
import transactionsIcon from '@assets/s_transactions.svg';
import vestingScheduleIcon2 from '@assets/s_vestingSchedule2.svg';
import vestingScheduleIcon from '@assets/s_vestingSchedule.svg';
import supportIcon from '@assets/support.svg';
import switchUserIcon from '@assets/switchUser.svg';
import Sidebar from '@components/molecules/Sidebar/Sidebar';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
  title: 'components/Sidebar',
  component: Sidebar,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof Sidebar>;

const Template: ComponentStory<typeof Sidebar> = (args) => <Sidebar {...args} />;

export const Collapsed = Template.bind({});
Collapsed.args = {
  collapsed: false,
  roleTitle: 'Founder',
  menuList: [
    { title: 'Dashboard', icon: dashboardIcon, hoverIcon: dashboardIcon2 },
    { title: 'Vesting schedule', icon: vestingScheduleIcon, hoverIcon: vestingScheduleIcon2 },
    { title: 'Token performance', icon: tokenPerformanceIcon, hoverIcon: tokenPerformanceIcon2 },
    { title: 'Cap table', icon: capTableIcon, hoverIcon: capTableIcon2 },
    { title: 'Tokenomics', icon: tokenomicsIcon, hoverIcon: tokenomicsIcon2 },
    { title: 'Transactions', icon: transactionsIcon, hoverIcon: transactionsIcon2 }
  ],
  submenuList: [
    { title: 'Notifications', icon: notificationsIcon },
    { title: 'Support', icon: supportIcon },
    { title: 'Switch to investor', icon: switchUserIcon }
  ],
  userName: 'John Doe',
  role: 'Founder'
};
