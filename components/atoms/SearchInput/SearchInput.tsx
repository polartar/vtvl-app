import searchIcon from '@assets/search.svg';
import styled from '@emotion/styled';
import React from 'react';

interface InputProps {
  size?: string;
  placeholder?: string;
}
export const SearchInput = (props: InputProps) => {
  const { size = 'medium', ...rest } = props;
  return (
    <InputWrapper size={size}>
      <img src={searchIcon} alt="searchIcon" />
      <input {...rest} />
    </InputWrapper>
  );
};

const InputWrapper = styled.div<{ size?: string }>`
  width: 100%;
  max-width: 280px;
  height: ${({ size }) => (size === 'small' ? '36px' : size === 'medium' ? '40px' : '44px')} !important;
  border-radius: 24px;
  border: 1px solid #d0d5dd;
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 0 12px;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
  img {
    width: 20px;
    height: 20px;
  }
  input {
    width: 85%;
    border: none;
    padding-left: 10px;
    outline: none;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #344054;
    font-family: 'Inter', sans-serif;
  }
`;
