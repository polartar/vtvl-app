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
import styled from '@emotion/styled';
import React from 'react';

import { Header } from '../global/Header';
import { Sidebar } from '../global/Sidebar';

// import React from "react";
// import styled from "@emotion/styled";
// import notificationsIcon from "@assets/notifications.svg";
// import capTableIcon2 from "@assets/s_capTable2.svg";
// import capTableIcon from "@assets/s_capTable.svg";
// import dashboardIcon2 from "@assets/s_dashboard2.svg";
// import dashboardIcon from "@assets/s_dashboard.svg";
// import tokenPerformanceIcon2 from "@assets/s_tokenPerformance2.svg";
// import tokenPerformanceIcon from "@assets/s_tokenPerformance.svg";
// import tokenomicsIcon2 from "@assets/s_tokenomics2.svg";
// import tokenomicsIcon from "@assets/s_tokenomics.svg";
// import transactionsIcon2 from "@assets/s_transactions2.svg";
// import transactionsIcon from "@assets/s_transactions.svg";
// import vestingScheduleIcon2 from "@assets/s_vestingSchedule2.svg";
// import vestingScheduleIcon from "@assets/s_vestingSchedule.svg";
// import supportIcon from "@assets/support.svg";
// import switchUserIcon from "@assets/switchUser.svg";

const Container = styled.section`
  min-width: 100vw;
  min-height: 100vh;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  min-height: calc(100vh - 80px);
`;

const SidebarProps = {
  collapsed: false,
  roleTitle: 'Founder',
  menuList: [
    { title: 'Dashboard', icon: dashboardIcon, hoverIcon: dashboardIcon2 },
    {
      title: 'Vesting schedule',
      icon: vestingScheduleIcon,
      hoverIcon: vestingScheduleIcon2
    },
    {
      title: 'Token performance',
      icon: tokenPerformanceIcon,
      hoverIcon: tokenPerformanceIcon2
    },
    { title: 'Cap table', icon: capTableIcon, hoverIcon: capTableIcon2 },
    { title: 'Tokenomics', icon: tokenomicsIcon, hoverIcon: tokenomicsIcon2 },
    {
      title: 'Transactions',
      icon: transactionsIcon,
      hoverIcon: transactionsIcon2
    }
  ],
  submenuList: [
    { title: 'Notifications', icon: notificationsIcon },
    { title: 'Support', icon: supportIcon },
    { title: 'Switch to investor', icon: switchUserIcon }
  ],
  userName: 'John Doe',
  role: 'Founder'
};

interface User {
  name: string;
}

interface DefaultLayoutProps {
  sidebar?: boolean;
  connected?: boolean;
  children?: any;
}

/**
 *  The purpose of this is to scaffold everything into this layout.
 *  This has a sidebar prop to determine if the Sidebar component should be shown or not.
 */
export const DefaultLayout = ({ sidebar = false, connected = false, ...props }: DefaultLayoutProps) => {
  const [user, setUser] = React.useState<User>();
  return (
    <Container>
      <Header
        connected={connected}
        user={user}
        onLogin={() => setUser({ name: 'Jane Doe' })}
        onLogout={() => setUser(undefined)}
        onCreateAccount={() => setUser({ name: 'Jane Doe' })}
      />
      <Layout>
        {connected && sidebar ? <Sidebar {...SidebarProps} /> : null}
        <div className="flex flex-col items-center grow p-8">{props.children}</div>
      </Layout>
    </Container>
  );
};
