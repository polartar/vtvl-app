import styled from '@emotion/styled';
import React from 'react';

interface Props {
  userName: string;
  role: string;
  compact: boolean;
}

const User = ({ userName, role, compact = false }: Props) => {
  return (
    <UserContainer>
      <img src="/images/user.png" alt="userImg" className={`transition-all ${compact ? 'mx-1' : 'mx-3'}`} />
      <div className={`transition-all ${compact ? 'w-0 opacity-0' : ''}`}>
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

export default User;
