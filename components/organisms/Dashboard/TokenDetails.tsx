/**
 * Token details for the dashboard.
 *
 */
import Card from '@components/atoms/Card/Card';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { formatNumber } from '@utils/token';
import { BNToAmountString } from '@utils/web3';
import { useMemo } from 'react';

const DashboardTokenDetails = () => {
  const { totalAllocation, totalClaimable, totalWithdrawn } = useDashboardContext();
  const { mintFormState } = useTokenContext();

  const values = useMemo(
    () => ({
      totalLocked: formatNumber(parseFloat(BNToAmountString(totalAllocation.sub(totalWithdrawn).sub(totalClaimable)))),
      totalUnlocked: formatNumber(parseFloat(BNToAmountString(totalWithdrawn.add(totalClaimable))))
    }),
    [totalAllocation, totalClaimable, totalWithdrawn]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 w-full grow">
      <Card title={`${mintFormState.symbol} Price`} value="$0.49367" />
      <Card title="Total locked" value={values.totalLocked} info="Sample info" />
      <Card title="USD value locked" value="$1,400,004" info="Sample info" />
      <Card title="Trading volume (24h)" value="$563,400,004" info="Sample info" />
      <Card title="Total unlocked (24h)" value={values.totalUnlocked} info="Sample info" />
      <Card title="Wallet balance" value="524,000" info="Sample info" />
    </div>
  );
};

export default DashboardTokenDetails;
