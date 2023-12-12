/**
 * Renders the action buttons for the dashboard.
 * @returns JSX element representing the action buttons.
 */
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';

const DashboardActionButtons = () => {
  const { mintFormState } = useTokenContext();
  const { setShowVestingSelectModal } = useVestingContext();

  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <div className="group relative">
        <button className="primary small row-center" onClick={() => setShowVestingSelectModal(true)}>
          <PlusIcon className="w-5 h-5" />
          <span className="whitespace-nowrap">Create</span>
        </button>
      </div>
      {mintFormState.address && !mintFormState.isImported && mintFormState.supplyCap === 'UNLIMITED' && (
        <button className="secondary small row-center" onClick={() => router.push('/dashboard/mint-supply')}>
          <PlusIcon className="w-5 h-5" />
          <span className="whitespace-nowrap">Mint Supply</span>
        </button>
      )}
    </div>
  );
};

export default DashboardActionButtons;
