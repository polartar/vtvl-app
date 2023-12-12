/**
 * Token details for the dashboard.
 *
 */
import Card from '@components/atoms/Card/Card';
import { useTokenContext } from '@providers/token.context';

const DashboardTokenDetails = () => {
  const { mintFormState } = useTokenContext();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Card title={`${mintFormState.symbol} Price`} value="$0.49367" />
      <Card title="Total locked" value="450,000" info="Sample info" />
      <Card title="USD value locked" value="$1,400,004" info="Sample info" />
      <Card title="Trading volume (24h)" value="$563,400,004" info="Sample info" />
      <Card title="Total unlocked (24h)" value="43,500" info="Sample info" />
      <Card title="Wallet balance" value="524,000" info="Sample info" />
    </div>
  );
};

export default DashboardTokenDetails;
