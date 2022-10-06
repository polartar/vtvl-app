import styled from '@emotion/styled';
import React from 'react';

interface Props {
  userName: string;
  role: string;
}

export const User = ({ userName, role }: Props) => {
  return (
    <UserContainer>
      <img src="/images/user.png" alt="userImg" />
      <div>
        <p>{userName}</p>
        <p>{role}</p>
      </div>
    </UserContainer>
  );
};

const UserContainer = styled.div`
  height: 40px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  font-family: 'Inter-Bold';
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  &:hover {
    cursor: pointer;
  }
  img {
    margin: 0 12px;
    width: 40px;
    height: 40px;
  }
  div {
    height: 40px;
    display: flex;
    flex-direction: column;
    p {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
    }
    p:nth-of-type(1) {
      font-weight: 500;
      color: #344054;
    }
    p:nth-of-type(2) {
      font-weight: 400;
      color: #1d2939;
    }
  }
`;
