import EmptyState from '@components/atoms/EmptyState/EmptyState';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Dashboard: NextPage = () => {
  const [hasProject, setHasProject] = useState(false);
  const router = useRouter();
  return (
    <div>
      <h1 className="h2 font-medium text-center mb-10">My Projects</h1>
      {!hasProject ? (
        <EmptyState
          image="/images/cryptocurrency-trading-bot.gif"
          title="No projects found"
          description={
            <>
              Your projects live here. Start a project by clicking on <br />"<strong>Mint a new token</strong>" or "
              <strong>Import existing tokent</strong>".
            </>
          }>
          <button
            type="button"
            className="primary flex flex-row gap-2 items-center"
            onClick={() => router.push('/minting-token')}>
            <img src="/icons/plus.svg" className="w-5 h-5" />
            Mint new token
          </button>
          <button type="button" className="line">
            Import existing token
          </button>
        </EmptyState>
      ) : null}
    </div>
  );
};

export default Dashboard;
