import styled from '@emotion/styled';
import React, { useEffect, useRef } from 'react';

interface Props {
  selected: boolean;
  hovered: boolean;
  children: string | JSX.Element;
  onClick: () => void;
  icon: string;
  hoverIcon: string;
  className?: string;
}

const SidebarItem = ({ selected, hovered, children, onClick, icon, hoverIcon, className }: Props) => {
  // const itemRef = useRef(null);
  // const sItem: any = document.getElementsByClassName('sidebar-item');
  // const sIcon: any = document.getElementsByClassName('sidebar-item-icon');
  // for (let i = 0; i < sItem.length; i++) {
  //   sItem[i].addEventListener('mouseover', (event: any) => {
  //     event.target.style.backgroundColor = '#1B369A';
  //     event.target.style.borderRadius = '24px';
  //   });

  //   sItem[i].addEventListener('mouseleave', (event: any) => {
  //     event.target.style.backgroundColor = 'transparent';
  //     event.target.style.borderRadius = '5px';
  //     event.target.style.transition = 'all 0.3s ease-out';
  //   });
  // }
  return (
    <SidebarItemContainer
      selected={selected ? 1 : 0}
      onClick={onClick}
      // ref={itemRef}
      className={`sidebar-item ${className}`}
      icon={icon}
      hoverIcon={hoverIcon}>
      <IconArea className="sidebar-item-icon" icon={icon} selected={selected ? 1 : 0} hoverIcon={hoverIcon} />
      {children}
    </SidebarItemContainer>
  );
};

const SidebarItemContainer = styled.div<{
  selected: number;
  icon: string;
  hoverIcon: string;
}>`
  height: 48px;
  border-radius: ${({ selected }) => (selected ? '24px' : '5px')};
  background-color: ${({ selected }) => (selected ? '#1B369A' : 'transparent')};
  display: flex;
  align-items: center;
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: ${({ selected }) => (selected ? '#F9FAFB' : '#1D2939')};
  margin: 6px auto;
  transition: all 0.3s ease-out;

  &:hover {
    cursor: pointer;
    background-color: #1b369a;
    border-radius: 24px;
    color: #f9fafb;
  }
  &:hover > .sidebar-item-icon {
    background-image: url(${({ hoverIcon }) => (!hoverIcon ? '/icons/s_dashboard2.svg' : hoverIcon)});
  }
  img {
    margin: 0 12px;
  }
`;
const IconArea = styled.div<{
  icon: string;
  selected: number;
  hoverIcon: string;
}>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin: 0 12px;
  background-image: url(${({ icon, selected, hoverIcon }) =>
    !icon ? (selected ? '/icons/s_dashboard2.svg' : '/icons/s_dashboard.svg') : selected ? hoverIcon : icon});
`;

export default SidebarItem;