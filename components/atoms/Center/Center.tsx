import styled from '@emotion/styled';
import React from 'react';

interface Props {
  children: any;
}

export const Center = ({ children }: Props) => {
  return <CenterWrapper>{children}</CenterWrapper>;
};

const CenterWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
