import styled from '@emotion/styled';
import React, { useEffect, useRef } from 'react';

interface Props {
  selected: boolean;
  disabled: boolean;
  children: string | JSX.Element;
  onClick: () => void;
  icon: string;
  hoverIcon?: string;
  className?: string;
}

const SidebarItem = ({ selected, disabled = false, children, onClick, icon, hoverIcon, className }: Props) => {
  return (
    <SidebarItemContainer
      selected={selected ? 1 : 0}
      disabled={disabled}
      onClick={onClick}
      className={`sidebar-item ${className}`}
      icon={icon}
      hoverIcon={String(hoverIcon)}>
      <IconArea className="sidebar-item-icon" icon={icon} selected={selected ? 1 : 0} hoverIcon={String(hoverIcon)} />
      {children}
    </SidebarItemContainer>
  );
};

const SidebarItemContainer = styled.div<{
  selected: number;
  icon: string;
  hoverIcon: string;
  disabled: boolean;
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

  ${({ disabled, hoverIcon }) =>
    disabled
      ? ''
      : `
    &:hover {
      cursor: pointer;
      background-color: #1b369a;
      border-radius: 24px;
      color: #f9fafb;
    }
    &:hover > .sidebar-item-icon {
      background-image: url(${!hoverIcon ? '/icons/s_dashboard2.svg' : hoverIcon});
    }
  `}

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
