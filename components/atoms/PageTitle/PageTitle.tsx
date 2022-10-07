import { Colors } from '../../CommonStyles';
import styled from '@emotion/styled';
import React from 'react';

interface Props {
  title: string;
}

const PageTitle = ({ title }: Props) => {
  return <Title>{title}</Title>;
};

const Title = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 30px;
  line-height: 38px;
  text-align: center;
  color: ${Colors.pageTitle};
`;

export default PageTitle;
