import Header from '@components/molecules/Header/Header';
import Sidebar from '@components/molecules/Sidebar/Sidebar';
import styled from '@emotion/styled';
import { useWeb3React } from '@web3-react/core';
import Head from 'next/head';
import React, { useContext } from 'react';

import AuthContext from '../../../providers/auth.context';

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
      route: '/dashboard'
    },
    {
      title: 'Vesting schedule',
      icon: '/icons/s_vestingSchedule.svg',
      hoverIcon: '/icons/s_vestingSchedule2.svg',
      route: '/vesting-schedule'
    },
    {
      title: 'Token performance',
      icon: '/icons/s_tokenPerformance.svg',
      hoverIcon: '/icons/s_tokenPerformance2.svg',
      route: '/token-performance'
    },
    {
      title: 'Cap table',
      icon: '/icons/s_capTable.svg',
      hoverIcon: '/icons/s_capTable2.svg',
      route: '/cap-table'
    },
    {
      title: 'Tokenomics',
      icon: '/icons/s_tokenomics.svg',
      hoverIcon: '/icons/s_tokenomics2.svg',
      route: '/tokenomics'
    },
    {
      title: 'Transactions',
      icon: '/icons/s_transactions.svg',
      hoverIcon: '/icons/s_transactions2.svg',
      route: '/transactions'
    },
    {
      title: 'Claims Portal',
      icon: '/icons/s_dashboard.svg',
      hoverIcon: '/icons/s_dashboard2.svg',
      route: '/tokens'
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
  const { user, error, logOut, showSideBar, toggleSideBar } = useContext(AuthContext);
  const { active } = useWeb3React();
  console.log("user here is ", user)
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
      <Layout>
        { user || sidebar || showSideBar ? <Sidebar {...SidebarProps} roleTitle ={user?.memberInfo?.type || 'founder'} /> : null}
        <div className="flex flex-col items-center flex-grow p-8 pt-7">{props.children}</div>
      </Layout>
    </Container>
  );
};

export default DefaultLayout;
