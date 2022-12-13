import styled from '@emotion/styled';
import { useClaimTokensContext } from '@providers/claim-tokens.context';
import Router, { useRouter } from 'next/router';
import React, { Fragment, useContext, useEffect } from 'react';

import AuthContext from '../../../providers/auth.context';
import { Colors } from '../../CommonStyles';
import IconText from '../../atoms/IconText/IconText';
import SidebarItem from '../../atoms/SidebarItem/SidebarItem';
import User from '../../atoms/User/User';

interface SubMenuItemProps {
  title: string;
  icon: string;
  route: string;
  available?: boolean;
}

interface MenuItemProps extends SubMenuItemProps {
  hoverIcon: string;
}

interface Props {
  collapsed?: boolean;
  roleTitle: string;
  menuList: MenuItemProps[];
  submenuList: SubMenuItemProps[];
  userName: string;
  role: string;
}

const Sidebar = ({ roleTitle, menuList, submenuList, userName, role }: Props) => {
  const { sidebarIsExpanded, expandSidebar, forceCollapseSidebar, user, logOut } = useContext(AuthContext);
  const { vestingSchedules } = useClaimTokensContext();
  const currentRoute = useRouter();
  const [selectedRoute, setSelectedRoute] = React.useState(currentRoute.pathname || '');
  const handleMenuClick = (route: string) => {
    setSelectedRoute(route);
    Router.push(route);
  };

  const hasTokensToClaim = (menu: any) => false; // temporary -- to use the old claim token
  // Boolean(menu.route === '/tokens' && vestingSchedules && vestingSchedules.length);

  // Force expand the sidebar on initial load when the device screen width is large
  useEffect(() => {
    if (window.innerWidth < 1366) {
      forceCollapseSidebar();
    }
  }, []);

  // Watch for the currentRoute's path to ensure update active state on the sidebar
  // This fixes redirection via route push
  useEffect(() => {
    setSelectedRoute(currentRoute.pathname);
  }, [currentRoute.pathname]);

  return (
    <SidebarContainer isExpanded={sidebarIsExpanded} className="transition-all">
      <img
        src="/icons/collapse-btn.svg"
        alt="toggle sidebar"
        onClick={expandSidebar}
        className={`absolute top-8 -right-2 h-4 w-4 z-30 cursor-pointer transform-gpu transition-all rounded-full ${
          sidebarIsExpanded ? 'rotate-180' : ''
        }`}
        data-tip="Toggle sidebar"
      />
      <div>
        <RoleTitle className={`transition-all ${sidebarIsExpanded ? 'text-sm' : 'text-tiny'}`}>{roleTitle}</RoleTitle>
        {menuList && menuList.length
          ? menuList.map((menu: any, index: number) => (
              <Fragment key={`menu-item-${index}`}>
                <SidebarItem
                  selected={selectedRoute.includes(menu.route)}
                  hovered={false}
                  onClick={() => (menu.available ? handleMenuClick(menu.route) : {})}
                  icon={menu.icon}
                  hoverIcon={menu.hoverIcon}
                  className={`${sidebarIsExpanded ? 'w-60' : ''} ${!menu.available ? 'opacity-40' : ''}`}>
                  <div
                    className={`w-full transition-width overflow-hidden whitespace-nowrap ${
                      sidebarIsExpanded ? '' : 'opacity-0 w-0'
                    }`}>
                    <div className="flex flex-row items-center justify-between mr-3">
                      <p>{menu.title}</p>
                      {hasTokensToClaim(menu) ? (
                        <div className="bg-primary-700 text-xs text-white rounded-full py-0.5 px-2">
                          {vestingSchedules.length}
                        </div>
                      ) : null}
                    </div>
                    {!menu.available ? <p className="text-xs text-neutral-400 -mt-1">Coming soon</p> : null}
                  </div>
                </SidebarItem>
                {/* Display only when the Claim portal link is available and has claimable tokens */}
                {/* We can probably refactor this one later into a component */}
                {hasTokensToClaim(menu)
                  ? vestingSchedules.map((schedule) => (
                      <div
                        key={`schedule-${schedule.id}`}
                        className={`text-neutral-700 font-medium py-2 cursor-pointer hover:bg-gray-200 rounded-full transition-all mt-3 last:mb-3 ${
                          sidebarIsExpanded ? 'px-12' : 'flex items-center justify-center'
                        } ${currentRoute.asPath.includes(schedule.id) ? 'bg-gray-200' : ''}`}
                        onClick={() => Router.push(`/tokens/${schedule.id}`)}>
                        {sidebarIsExpanded ? schedule.data.name : schedule.data.name?.charAt(0)}
                      </div>
                    ))
                  : null}
              </Fragment>
            ))
          : null}
      </div>
      <div>
        {submenuList && submenuList.length
          ? submenuList.map((submenu, index) => (
              <IconText
                key={`submenu-item-${index}`}
                sideIcon={submenu.icon}
                className={`${!submenu.available ? 'opacity-40' : ''}`}>
                <span
                  className={`transition-width overflow-hidden whitespace-nowrap ${
                    sidebarIsExpanded ? '' : 'opacity-0 w-0'
                  }`}>
                  <p>{submenu.title}</p>
                  {!submenu.available ? <p className="text-xs text-neutral-400 -mt-1">Coming soon</p> : null}
                </span>
              </IconText>
            ))
          : null}
        <UserContainer>
          <User
            userName={user?.memberInfo?.name || user?.displayName || 'John Doe'}
            profilePhoto={user?.photoURL || ''}
            role={user?.memberInfo?.type || 'founder'}
            compact={!sidebarIsExpanded}
          />
          {sidebarIsExpanded ? <LogoutImg src="/icons/logout.svg" alt="logoutImg" onClick={() => logOut()} /> : null}
        </UserContainer>
      </div>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside<{
  isExpanded: boolean;
}>`
  width: ${({ isExpanded }) => (isExpanded ? '279px' : '80px')};
  position: relative;
  min-height: calc(100vh - 82px);
  border-right: 1px solid ${Colors.border};
  background: ${Colors.background};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 16px 16px;
`;
const RoleTitle = styled.span`
  font-style: normal;
  font-weight: 700;
  color: ${Colors.text};
  text-transform: uppercase;
  height: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;
const UserContainer = styled.div`
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 24px;
  border-top: 1px solid ${Colors.border};
  margin: 0 auto;
`;
const LogoutImg = styled.img`
  width: 20px;
  cursor: pointer;
  &:hover {
    scale: 1.1;
  }
`;

export default Sidebar;
