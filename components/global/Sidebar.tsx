import styled from '@emotion/styled';
import logoutImg from '/public/icons/logout.svg';
import { IconText } from './IconText';
import { SidebarItem } from './SidebarItem';
import { User } from './User';
import React from 'react';

interface Props {
  collapsed?: boolean;
  roleTitle: string;
  menuList: { title: string; icon: string; hoverIcon: string }[];
  submenuList: { title: string; icon: string }[];
  userName: string;
  role: string;
}

export const Sidebar = ({ roleTitle, menuList, submenuList, userName, role }: Props) => {
  const [selectedId, setSelectedId] = React.useState(0);
  return (
    <SidebarContainer>
      <div>
        <RoleTitle>{roleTitle}</RoleTitle>
        {menuList.map((menu: any, index: number) => (
          <SidebarItem
            key={index}
            selected={selectedId === index}
            hovered={false}
            children={menu.title}
            onClick={() => setSelectedId(index)}
            icon={menu.icon}
            hoverIcon={menu.hoverIcon}
          />
        ))}
      </div>
      <div>
        {submenuList.map((submenu, index) => (
          <IconText key={index} sideIcon={submenu.icon} children={submenu.title} />
        ))}
        <UserContainer>
          <User userName={userName} role={role} />
          <LogoutImg src={logoutImg} alt="logoutImg" />
        </UserContainer>
      </div>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 279px;
  min-height: calc(100vh - 82px);
  border-right: 1px solid #EAECF0;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 16px 16px;
`;
const RoleTitle = styled.span`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  color: #1d2939;
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
  border-top: 1px solid #EAECF0;
  margin: 0 auto;
`;
const LogoutImg = styled.img`
  width: 20px;
  cursor: pointer;
  &:hover {
    scale: 1.1;
  }
`;
