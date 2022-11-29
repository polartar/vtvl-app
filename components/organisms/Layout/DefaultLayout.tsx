import PageLoader from '@components/atoms/PageLoader/PageLoader';
import Header from '@components/molecules/Header/Header';
import Sidebar from '@components/molecules/Sidebar/Sidebar';
import styled from '@emotion/styled';
import OnboardingContext from '@providers/onboarding.context';
import { useWeb3React } from '@web3-react/core';
import Head from 'next/head';
import { useLoaderContext } from 'providers/loader.context';
import React, { useContext, useEffect } from 'react';

import AuthContext from '../../../providers/auth.context';

const Container = styled.section`
  width: 100vw;
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
 * INVESTOR/EMPLOYEE
 * - Portfolio Overview
 * - Claims Portal
 * - Support
 * - Switch to founder
 *
 * FOUNDER
 * - Dashboard
 *  - Minting token / Import token
 *  - Additional Supply
 *  - Funding Contracts
 * - Vesting Schedule
 * - Cap table
 */

// Available routes for Founders
const FounderRoutes = {
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

// Menulist for both Employee and Investors
const employeeInvestorMenuItems = {
  menuList: [
    // {
    //   title: 'Portfolio Overview',
    //   icon: '/icons/s_dashboard.svg',
    //   hoverIcon: '/icons/s_dashboard2.svg',
    //   route: '/dashboard',
    //   available: false
    // },
    {
      title: 'Claims Portal',
      icon: '/icons/s_dashboard.svg',
      hoverIcon: '/icons/s_dashboard2.svg',
      route: '/tokens',
      available: true
    }
  ],
  submenuList: [
    // { title: 'Notifications', icon: '/icons/notifications.svg', route: '/notifications' },
    { title: 'Support', icon: '/icons/support.svg', route: '/support' },
    { title: 'Switch to founder', icon: '/icons/switchUser.svg', route: '/switch-account' }
  ]
};

// Routes available for Employees
const EmployeeRoutes = {
  collapsed: false,
  roleTitle: 'Employee',
  menuList: [...employeeInvestorMenuItems.menuList],
  submenuList: [...employeeInvestorMenuItems.submenuList],
  userName: 'John Doe',
  role: 'Employee'
};
// Routes available for Investors -- same as the employees
const InvestorRoutes = {
  collapsed: false,
  roleTitle: 'Investor',
  menuList: [...employeeInvestorMenuItems.menuList],
  submenuList: [...employeeInvestorMenuItems.submenuList],
  userName: 'John Doe',
  role: 'Investor'
};
// Routes available for Managers -- temporary
const ManagerRoutes = {
  ...EmployeeRoutes,
  menuList: [
    {
      title: 'Vesting schedule',
      icon: '/icons/s_vestingSchedule.svg',
      hoverIcon: '/icons/s_vestingSchedule2.svg',
      route: '/vesting-schedule',
      available: true
    },
    ...EmployeeRoutes.menuList
  ]
};

const SidebarProps: Record<string, any> = {
  founder: { ...FounderRoutes },
  employee: { ...EmployeeRoutes },
  investor: { ...InvestorRoutes },
  manager: { ...ManagerRoutes }
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
  const { loading } = useLoaderContext();
  const { active } = useWeb3React();
  useEffect(() => {
    (async () => await refreshUser())();
  }, []);

  const displaySideBar = Boolean(
    !inProgress && user && user?.memberInfo && user.memberInfo.type && SidebarProps[user?.memberInfo?.type]
  );

  const getUserSidebarLinks =
    user && user.memberInfo && user.memberInfo.type ? SidebarProps[user?.memberInfo?.type] : {};

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
        {displaySideBar ? <Sidebar {...getUserSidebarLinks} roleTitle={user?.memberInfo?.type || 'founder'} /> : null}
        <div className="relative">
          {loading && <PageLoader />}
          <Main
            sidebarIsExpanded={sidebarIsExpanded}
            sidebarIsShown={displaySideBar}
            className="flex flex-col items-center p-8 pt-7">
            {props.children}
          </Main>
        </div>
      </Layout>
    </Container>
  );
};

export default DefaultLayout;
