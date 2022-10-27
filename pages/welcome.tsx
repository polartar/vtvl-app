import EmptyState from '@components/atoms/EmptyState/EmptyState';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import { NextPage } from 'next';
import Router from 'next/router';

const TeamWelcome: NextPage = () => {
  return (
    <>
      <h1 className="h2 font-medium text-center mb-10">Welcome to VTVL, Satoshi</h1>
      <p className="paragraphy-small neutral-text mb-3">You have been invited by</p>
      <TokenProfile name="Biconomy" symbol="BICO" logo="/images/biconomy-logo.png" />
      <EmptyState
        image="/images/cryptocurrency-management.gif"
        description={
          <>Your journey to seamless vesting schedules and automated token distributions begins here. Ready to begin?</>
        }>
        <button type="button" className="primary flex" onClick={() => Router.push(`/vesting-schedule`)}>
          Let's get started
        </button>
      </EmptyState>
    </>
  );
};

export default TeamWelcome;
