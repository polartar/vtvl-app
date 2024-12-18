import Button from '@components/atoms/Button/Button';
import Form from '@components/atoms/FormControls/Form/Form';
import PageLoader from '@components/atoms/PageLoader/PageLoader';
import PromptModal from '@components/atoms/PromptModal/PromptModal';
import ThemeLoader from '@components/atoms/ThemeLoader/ThemeLoader';
import ConnectWalletOptionsProps from '@components/molecules/ConnectWalletOptions/ConnectWalletOptions';
import Header from '@components/molecules/Header/Header';
import Sidebar from '@components/molecules/Sidebar/Sidebar';
import styled from '@emotion/styled';
import { useDashboardContext } from '@providers/dashboard.context';
import { useGlobalContext } from '@providers/global.context';
import OnboardingContext from '@providers/onboarding.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import useEagerConnect from 'hooks/useEagerConnect';
import useInactiveListener from 'hooks/useInactiveListener';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLoaderContext } from 'providers/loader.context';
import React, { useContext, useEffect, useState } from 'react';
import Modal, { Styles } from 'react-modal';
import { toast } from 'react-toastify';
import { WEBSITE_NAME } from 'utils/constants';

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
  const {
    user,
    recipient,
    currentSafe,
    error,
    logOut,
    showSideBar,
    sidebarIsExpanded,
    toggleSideBar,
    refreshUser,
    switchRole,
    roleOverride
  } = useContext(AuthContext);
  const { inProgress } = useContext(OnboardingContext);
  const { loading } = useLoaderContext();
  const {
    website: { theme }
  } = useGlobalContext();
  const {
    isLoading,
    website: { name, assets }
  } = useGlobalContext();
  const { active, account, connector } = useWeb3React();
  const [sidebarProperties, setSidebarProperties] = useState({
    roleTitle: 'Anonymous',
    role: '',
    userName: '',
    menuList: [],
    submenuList: []
  });
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const router = useRouter();

  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

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
        title: 'Contracts',
        route: '/contracts',
        icon: '/icons/contracts.svg',
        hoverIcon: '/icons/contracts-hover.svg',
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
        title: 'Recipients',
        icon: '/icons/recipient.svg',
        hoverIcon: '/icons/recipient-hover.svg',
        route: '/recipient',
        available: true
      },
      // {
      //   title: 'Connect safe',
      //   icon: '/icons/s_vestingSchedule.svg',
      //   hoverIcon: '/icons/s_vestingSchedule2.svg',
      //   route: '/onboarding/setup-safes',
      //   available: true
      // },
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
      { title: 'Notifications', icon: '/icons/notifications.svg', hoverIcon: '', route: '/notifications' },
      {
        title: 'Support',
        icon: '/icons/support.svg',
        hoverIcon: '/icons/support-hover.svg',
        route: 'https://vtvl.gitbook.io/gettingstarted/introduction/setting-up-your-wallet',
        isExternal: true,
        available: true
      },
      {
        title: 'Switch to investor',
        icon: '/icons/switchUser.svg',
        hoverIcon: '/icons/switchUser2.svg',
        route: '/switch-role',
        available: true,
        onClick: async () => {
          await switchRole('investor');
          toast.success(
            <>
              You switched to <strong className="text-primary-900">Investor</strong> mode.
            </>
          );
        }
      },
      {
        title: 'Settings',
        icon: '/icons/settings.svg',
        hoverIcon: 'icons/settings-hover.svg',
        route: '/settings',
        available: true
      }
    ],
    userName: 'John Doe',
    role: 'founder'
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
        route: '/claim-portal',
        icon: '/icons/claims-portal.svg',
        hoverIcon: '/icons/claims-portal-hover.svg',
        available: true
      }
      // {
      //   title: 'My tokens',
      //   icon: '/icons/s_dashboard.svg',
      //   hoverIcon: '/icons/s_dashboard2.svg',
      //   route: '/tokens',
      //   available: true
      // }
    ],
    submenuList: [
      // { title: 'Notifications', icon: '/icons/notifications.svg', route: '/notifications' },
      {
        title: 'Support',
        icon: '/icons/support.svg',
        hoverIcon: '/icons/support-hover.svg',
        route: 'https://vtvl.gitbook.io/gettingstarted/introduction/setting-up-your-wallet',
        isExternal: true,
        available: true
      },
      // Only add this option if the user is a founder
      ...(user?.memberInfo?.type === 'founder'
        ? [
            {
              title: 'Switch to founder',
              icon: '/icons/switchUser.svg',
              hoverIcon: '/icons/switchUser2.svg',
              route: '/switch-role',
              available: true,
              onClick: async () => {
                await switchRole('');
                toast.success(
                  <>
                    You switched to <strong className="text-secondary-900">Founder</strong> mode.
                  </>
                );
              }
            }
          ]
        : [])
    ]
  };

  // Routes available for Employees
  const EmployeeRoutes = {
    collapsed: false,
    roleTitle: 'Employee',
    menuList: [...employeeInvestorMenuItems.menuList],
    submenuList: [...employeeInvestorMenuItems.submenuList],
    userName: 'John Doe',
    role: 'employee'
  };
  // Routes available for Investors -- same as the employees
  const InvestorRoutes = {
    collapsed: false,
    roleTitle: 'Investor',
    menuList: [...employeeInvestorMenuItems.menuList],
    submenuList: [...employeeInvestorMenuItems.submenuList],
    userName: 'John Doe',
    role: 'investor'
  };
  // Routes available for Managers -- temporary
  const ManagerRoutes = {
    ...EmployeeRoutes,
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
      ...EmployeeRoutes.menuList
    ],
    roleTitle: 'Manager',
    role: 'manager'
  };

  // Routes available for Manager level 2 -- Manager that is extended with Cap Table view
  const Manager2Routes = {
    ...EmployeeRoutes,
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
      ...EmployeeRoutes.menuList
    ],
    roleTitle: 'Manager',
    role: 'manager2'
  };

  const SidebarProps: Record<string, any> = {
    founder: { ...FounderRoutes },
    employee: { ...EmployeeRoutes },
    investor: { ...InvestorRoutes },
    manager: { ...ManagerRoutes },
    manager2: { ...Manager2Routes }
  };

  // Vesting schedule section
  const { fetchDashboardData } = useDashboardContext();
  const {
    scheduleMode,
    deleteSchedule,
    resetVestingState,
    deleteInProgress,
    setDeleteInProgress,
    showDeleteModal,
    setShowDeleteModal
  } = useVestingContext();
  const {
    website: { organizationId: webOrgId }
  } = useGlobalContext();

  // Hides the modal and sets the necessary states.
  const handleHideModal = () => {
    setShowDeleteModal(false);
    resetVestingState();
  };

  // Actually deletes the data from the DB then closes the modal.
  const handleDelete = async (id: string) => {
    setDeleteInProgress(true);
    const deletion = await deleteSchedule(id);
    console.log('Deleted?', deletion);
    await fetchDashboardData();
    handleHideModal();
    setDeleteInProgress(false);
  };

  // Modal styles for the ledger modal
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: '900',
      overflowY: 'auto',
      paddingTop: '1rem',
      paddingBottom: '1rem'
    },
    content: {
      width: '100%',
      maxWidth: '480px',
      backgroundColor: '#fff',
      position: 'absolute',
      filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      borderRadius: '1.5rem',
      inset: '24px 40px 24px 50%',
      transform: 'translateX(-50%)'
    }
  };

  const displaySideBar = Boolean(
    // MOCK DISPLAY
    // true
    !inProgress &&
      user &&
      user?.memberInfo &&
      user.memberInfo.type &&
      ![
        '/recipient/schedule',
        '/recipient/confirm',
        '/recipient/create',
        '/member',
        '/magic-link-verification'
      ].includes(router.pathname) &&
      SidebarProps[user?.memberInfo?.type]
  );

  const handleWalletConnection = () => {
    setConnectWalletModal(false);
  };

  useEffect(() => {
    (async () => await refreshUser())();
  }, []);

  useEffect(() => {
    if (user && user.memberInfo && user.memberInfo.type) {
      if (user.memberInfo.type === 'founder' && roleOverride) {
        // set the sidebar items into the switched role
        setSidebarProperties({ ...SidebarProps[roleOverride] });
      } else {
        // Normally set the sidebar items to corresponding user type
        setSidebarProperties({ ...SidebarProps[user?.memberInfo?.type] });
      }
    } else {
      // For testing purposes only
      setSidebarProperties({ ...SidebarProps.employee });
    }
  }, [user, currentSafe, roleOverride]);

  useEffect(() => {
    // Check if the user has a wallet connected on all of the pages except:
    // 1. onboarding/sign-up
    // 2. onboarding/login
    // 3. onboarding/member-login
    // 4. onboarding/
    // 5. onboarding/connect-wallet
    const hideConnectModalOnRoutes = [
      '/onboarding/sign-up',
      '/onboarding/login',
      '/onboarding',
      '/onboarding/member-login',
      '/onboarding/connect-wallet',
      '/expired',
      '/recipient/create',
      '/recipient/schedule',
      '/member',
      '/404',
      '/not-found',
      '/terms',
      '/privacypolicy',
      '/magic-link-verification'
    ];

    if (!hideConnectModalOnRoutes.includes(router.pathname) && !active && !account) {
      setConnectWalletModal(true);
    } else {
      setConnectWalletModal(false);
    }
  }, [account, active, router]);

  const renderFavicons = (icon: string) => (
    <>
      <link rel="apple-touch-icon" sizes="180x180" href={icon} />
      <link rel="icon" type="image/png" sizes="32x32" href={icon} />
      <link rel="icon" type="image/png" sizes="16x16" href={icon} />
      <link rel="mask-icon" href={icon} color="#fefefe" />
      <meta name="msapplication-TileColor" content="#fff" />
      <meta name="theme-color" content="#ffffff" />
    </>
  );

  return (
    <>
      <Container>
        <Head>
          <title>{name || WEBSITE_NAME}</title>
          {isLoading
            ? renderFavicons('/default-loader-icon.png')
            : assets?.logoFavicon
            ? renderFavicons(assets.logoFavicon.src)
            : renderFavicons('/favicon.ico')}
        </Head>
        <Header
          connected={active}
          user={user}
          onLogout={() => logOut()}
          toggleSideBar={toggleSideBar}
          onConnect={() => setConnectWalletModal(true)}
          // onLogin={() => setUser({ name: 'Jane Doe' })}
          // onCreateAccount={() => setUser({ name: 'Jane Doe' })}
        />
        <Layout className="flex flex-row w-full">
          {displaySideBar ? <Sidebar {...sidebarProperties} /> : null}
          <div className="relative">
            {loading && <PageLoader loader={webOrgId ? 'global' : 'default'} />}
            <Main
              sidebarIsExpanded={sidebarIsExpanded}
              sidebarIsShown={displaySideBar}
              className="flex flex-col items-center pt-7">
              {props.children}
            </Main>
          </div>
        </Layout>
      </Container>
      <Modal isOpen={connectWalletModal} style={modalStyles}>
        <ConnectWalletOptionsProps onConnect={handleWalletConnection} />
      </Modal>

      {/* DELETE SCHEDULE MODAL PROMP */}
      <PromptModal isOpen={showDeleteModal} hideModal={handleHideModal} size="small">
        <Form isSubmitting={deleteInProgress}>
          <div className="text-center flex items-center justify-center flex-col gap-3 p-6">
            <div>
              <div>
                Delete this schedule
                {scheduleMode && scheduleMode.data && scheduleMode.data.name ? `: ${scheduleMode.data.name}` : ''}?
              </div>
              <p className="text-xs text-neutral-400 mb-3">It will be gone forever</p>
            </div>
            <div className="flex flex-row items-center justify-center gap-3">
              <button type="button" className="primary" onClick={handleHideModal}>
                Cancel
              </button>
              <Button type="button" onClick={() => handleDelete(scheduleMode.id!)} loading={deleteInProgress}>
                Delete
              </Button>
            </div>
          </div>
        </Form>
      </PromptModal>
      {/* {theme ? <ThemeLoader url={theme} /> : null} */}
    </>
  );
};

export default DefaultLayout;
