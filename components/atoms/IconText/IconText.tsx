import styled from '@emotion/styled';
import React from 'react';

interface Props {
  sideIcon?: string;
  children: string | JSX.Element;
  className?: string;
}

const IconText = ({ sideIcon, children, className = '' }: Props) => {
  return (
    <IconTextContainer className={className}>
      <img src={sideIcon ? sideIcon : '/icons/sidebarItem.svg'} alt="sideIcon" />
      {children}
    </IconTextContainer>
  );
};

const IconTextContainer = styled.div`
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

export default IconText;
