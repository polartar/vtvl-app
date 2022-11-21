import Header from '@components/molecules/Header/Header';
import Sidebar from '@components/molecules/Sidebar/Sidebar';
import styled from '@emotion/styled';
import OnboardingContext from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import Head from 'next/head';
import React, { useContext, useEffect } from 'react';

import AuthContext from '../../../providers/auth.context';

const Container = styled.section`
  min-width: 100vw;
  min-height: 100vh;
`;

const Layout = styled.div`
  min-height: calc(100vh - 80px);
`;

/**
 * The purpose of this forced width is to prevent a bug on the main container's width (overlapping the window when exceeds a large content) and having children with horizontal scrolls.
 * The bug only happens when the main container is in flex which we need to properly display the layout.
 */
const Main = styled.main<{ sidebarIsExpanded: boolean; sidebarIsShown: boolean }>`
  width: ${({ sidebarIsShown, sidebarIsExpanded }) =>
    sidebarIsShown ? 'calc(100vw - ' + (sidebarIsExpanded ? '279px' : '80px') + ');' : '100vw;'};
`;

/**
 * SIDEBAR ITEMS BASED ON USER ROLES
 *
 * INVESTOR
 * - Portfolio Overview
 * - Claims Portal
 * - Support
 * - Switch to founder
 *
 * FOUNDER
 * -
 *
 * EMPLOYEE
 */

const SidebarProps = {
  collapsed: false,
  roleTitle: 'Founder',
  menuList: [
    {
      title: 'Dashboard',
      icon: '/icons/s_dashboard.svg',
      hoverIcon: '/icons/s_dashboard2.svg',
      route: '/dashboard',
      available: true
    },
    {
      title: 'Vesting schedule',
      icon: '/icons/s_vestingSchedule.svg',
      hoverIcon: '/icons/s_vestingSchedule2.svg',
      route: '/vesting-schedule',
      available: true
    },
    {
      title: 'Cap table',
      icon: '/icons/s_capTable.svg',
      hoverIcon: '/icons/s_capTable2.svg',
      route: '/cap-table',
      available: true
    },
    {
      title: 'Claims Portal',
      icon: '/icons/s_dashboard.svg',
      hoverIcon: '/icons/s_dashboard2.svg',
      route: '/tokens',
      available: true
    },
    {
      title: 'Token performance',
      icon: '/icons/s_tokenPerformance.svg',
      hoverIcon: '/icons/s_tokenPerformance2.svg',
      route: '/token-performance',
      available: false
    },
    {
      title: 'Tokenomics',
      icon: '/icons/s_tokenomics.svg',
      hoverIcon: '/icons/s_tokenomics2.svg',
      route: '/tokenomics',
      available: false
    },
    {
      title: 'Transactions',
      icon: '/icons/s_transactions.svg',
      hoverIcon: '/icons/s_transactions2.svg',
      route: '/transactions',
      available: false
    }
  ],
  submenuList: [
    { title: 'Notifications', icon: '/icons/notifications.svg', route: '/notifications' },
    { title: 'Support', icon: '/icons/support.svg', route: '/support' },
    { title: 'Switch to investor', icon: '/icons/switchUser.svg', route: '/switch-account' }
  ],
  userName: 'John Doe',
  role: 'Founder'
};

interface DefaultLayoutProps {
  sidebar?: boolean;
  connected?: boolean;
  children?: any;
}

/**
 *  The purpose of this is to scaffold everything into this layout.
 *  This has a sidebar prop to determine if the Sidebar component should be shown or not.
 */
const DefaultLayout = ({ sidebar = false, ...props }: DefaultLayoutProps) => {
  const { user, error, logOut, showSideBar, sidebarIsExpanded, toggleSideBar, refreshUser } = useContext(AuthContext);
  const { inProgress } = useContext(OnboardingContext);
  const { active } = useWeb3React();
  useEffect(() => {
    (async () => await refreshUser())();
  }, []);
  console.log('in progress here is ', inProgress);
  return (
    <Container>
      <Head>
        <title>VTVL</title>
      </Head>
      <Header
        connected={active}
        user={user}
        onLogout={() => logOut()}
        toggleSideBar={toggleSideBar}
        // onLogin={() => setUser({ name: 'Jane Doe' })}
        // onCreateAccount={() => setUser({ name: 'Jane Doe' })}
      />
      <Layout className="flex flex-row w-full">
        {(user || sidebar || showSideBar) && !inProgress ? (
          <Sidebar {...SidebarProps} roleTitle={user?.memberInfo?.type || 'founder'} />
        ) : null}
        <Main
          sidebarIsExpanded={sidebarIsExpanded}
          sidebarIsShown={(user || sidebar || showSideBar) && !inProgress}
          className="flex flex-col items-center p-8 pt-7">
          {props.children}
        </Main>
      </Layout>
    </Container>
  );
};

export default DefaultLayout;
