import styled from '@emotion/styled';
import Router, { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';

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
  const currentRoute = useRouter();
  const [selectedRoute, setSelectedRoute] = React.useState(currentRoute.pathname || '');
  const handleMenuClick = (route: string) => {
    setSelectedRoute(route);
    Router.push(route);
  };

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
        className={`absolute top-8 -right-2 h-4 w-4 z-50 cursor-pointer transform-gpu transition-all rounded-full ${
          sidebarIsExpanded ? 'rotate-180' : ''
        }`}
        data-tip="Toggle sidebar"
      />
      <div>
        <RoleTitle className={`transition-all ${sidebarIsExpanded ? 'text-sm' : 'text-tiny'}`}>{roleTitle}</RoleTitle>
        {menuList.map((menu: any, index: number) => (
          <SidebarItem
            key={index}
            selected={selectedRoute.includes(menu.route)}
            hovered={false}
            onClick={() => (menu.available ? handleMenuClick(menu.route) : {})}
            icon={menu.icon}
            hoverIcon={menu.hoverIcon}
            className={`${sidebarIsExpanded ? 'w-60' : ''} ${!menu.available ? 'opacity-40' : ''}`}>
            <span
              className={`transition-width overflow-hidden whitespace-nowrap ${
                sidebarIsExpanded ? '' : 'opacity-0 w-0'
              }`}>
              <p>{menu.title}</p>
              {!menu.available ? <p className="text-xs text-neutral-400 -mt-1">Coming soon</p> : null}
            </span>
          </SidebarItem>
        ))}
      </div>
      <div>
        {submenuList.map((submenu, index) => (
          <IconText key={index} sideIcon={submenu.icon} className={`${!submenu.available ? 'opacity-40' : ''}`}>
            <span
              className={`transition-width overflow-hidden whitespace-nowrap ${
                sidebarIsExpanded ? '' : 'opacity-0 w-0'
              }`}>
              <p>{submenu.title}</p>
              {!submenu.available ? <p className="text-xs text-neutral-400 -mt-1">Coming soon</p> : null}
            </span>
          </IconText>
        ))}
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
  @media only screen and (min-width: 1366px) {
    width: 279px;
  }
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
