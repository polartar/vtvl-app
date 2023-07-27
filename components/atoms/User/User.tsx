import styled from '@emotion/styled';
import React from 'react';

import Avatar from '../Avatar/Avatar';

interface Props {
  userName: string;
  role: string;
  compact: boolean;
  profilePhoto?: string;
}

const User = ({ userName, role, compact = false, profilePhoto }: Props) => {
  return (
    <UserContainer>
      {profilePhoto ? (
        <img
          src={profilePhoto || '/images/user.png'}
          alt="userImg"
          className={`transition-all rounded-full ${compact ? 'mx-1' : 'mx-3'}`}
        />
      ) : (
        // Temporarily use role as avatar initials -- update later
        <Avatar name={role} />
      )}
      <div className={`transition-all whitespace-nowrap ${compact ? 'w-0 opacity-0' : ''}`}>
        {userName.length && <p>{userName?.length > 20 ? `${userName.substring(0, 20)}...` : userName}</p>}
        <p className="capitalize">{role}</p>
      </div>
    </UserContainer>
  );
};

const UserContainer = styled.div`
  height: 40px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
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
