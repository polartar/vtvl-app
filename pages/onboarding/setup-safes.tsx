import { NextPage } from 'next';

import { BackButton } from '../../components/atoms/BackButton/BackButton';
import { EmptyState } from '../../components/atoms/EmptyState/EmptyState';

const SetupSafesPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your safe</h1>
      <div className="w-full my-6 panel">
        <h2 className="h5 font-semibold text-neutral-900">Your safes</h2>
        <p className="text-sm text-neutral-500">
          You can natively create new, import or login to your existing gnisis safe multisig.
        </p>
        <p className="mt-5 text-sm text-neutral-500">List of 0 safes</p>
        <div className="flex items-center justify-center mt-12 mb-6">
          <EmptyState
            title="No safes found"
            description={[
              'Setup a new multi-signature wallet. Get started by clicking on "',
              <strong>Create New Safe</strong>,
              '".'
            ]}
          />
        </div>
        <div className="border-t border-b border-neutral-200 p-3 flex items-center justify-center">
          <button className="line primary">Create New Safe</button>
        </div>
        <div className="flex flex-row justify-between items-center mt-6">
          <BackButton label="Return to account setup" href="/" />
          <button className="flex flex-row items-center gap-2 primary">
            Proceed{' '}
            <img src="/icons/arrow-small-left.svg" alt="Proceed" className="rotate-180 fill-current text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupSafesPage;
