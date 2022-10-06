import styled from '@emotion/styled';
import React from 'react';

import sidebarItemImg from '/public/icons/sidebarItem.svg';

interface Props {
  sideIcon?: string;
  children: string;
}

export const IconText = ({ sideIcon, children }: Props) => {
  return (
    <IconTextContainer>
      <img src={sideIcon ? sideIcon : sidebarItemImg} alt="sideIcon" />
      {children}
    </IconTextContainer>
  );
};

const IconTextContainer = styled.div`
  width: 247px;
  height: 40px;
  background-color: transparent;
  display: flex;
  align-items: center;
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #1d2939;
  margin: 10px auto;
  &:hover {
    cursor: pointer;
  }
  img {
    margin: 0 12px;
  }
`;
