import EmptyState from '@components/atoms/EmptyState/EmptyState';
import { ComponentMeta } from '@storybook/react';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'components/EmptyState',
  component: EmptyState
} as ComponentMeta<typeof EmptyState>;

export const SimpleText = () => {
  return (
    <EmptyState
      title="No safes found"
      description={[
        'Setup a new multi-signature wallet. Get started by clicking on "',
        <strong>Create new safe</strong>,
        '".'
      ]}
    />
  );
};

export const WithImage = () => {
  return (
    <EmptyState
      title="No projects found"
      description={[
        'Your projects live here. Start a project by clicking on "',
        <strong>Mint a new token</strong>,
        '" or "',
        <strong>Import existing token</strong>,
        '".'
      ]}
      image="assets/images/cryptocurrency-trading-bot.gif"
    />
  );
};

export const WithExtras = () => {
  return (
    <EmptyState
      title="No projects found"
      description={[
        'Your projects live here. Start a project by clicking on "',
        <strong>Mint a new token</strong>,
        '" or "',
        <strong>Import existing token</strong>,
        '".'
      ]}
      image="assets/images/cryptocurrency-trading-bot.gif">
      <button className="primary">Mint new token</button>
      <button className="line">Import existing token</button>
    </EmptyState>
  );
};
