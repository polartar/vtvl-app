import styled from '@emotion/styled';
import Router, { useRouter } from 'next/router';
import React from 'react';

import { Colors } from '../../CommonStyles';
import IconText from '../../atoms/IconText/IconText';
import SidebarItem from '../../atoms/SidebarItem/SidebarItem';
import User from '../../atoms/User/User';

interface SubMenuItemProps {
  title: string;
  icon: string;
  route: string;
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
  const currentRoute = useRouter();
  const [selectedRoute, setSelectedRoute] = React.useState(currentRoute.pathname || '');
  const handleMenuClick = (route: string) => {
    setSelectedRoute(route);
    Router.push(route);
  };
  return (
    <SidebarContainer>
      <div>
        <RoleTitle>{roleTitle}</RoleTitle>
        {menuList.map((menu: any, index: number) => (
          <SidebarItem
            key={index}
            selected={selectedRoute.includes(menu.route)}
            hovered={false}
            onClick={() => handleMenuClick(menu.route)}
            icon={menu.icon}
            hoverIcon={menu.hoverIcon}>
            {menu.title}
          </SidebarItem>
        ))}
      </div>
      <div>
        {submenuList.map((submenu, index) => (
          <IconText key={index} sideIcon={submenu.icon}>
            {submenu.title}
          </IconText>
        ))}
        <UserContainer>
          <User userName={userName} role={role} />
          <LogoutImg src="/icons/logout.svg" alt="logoutImg" />
        </UserContainer>
      </div>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 279px;
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
  font-size: 14px;
  line-height: 24px;
  color: ${Colors.text};
  text-transform: uppercase;
  margin-left: 16px;
`;
const UserContainer = styled.div`
  width: 247px;
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
