import Chip from '@components/atoms/Chip/Chip';
import { IVestingContractProps } from 'types/models/vesting';
import { formatNumber } from 'utils/token';

const ContractOverview = ({
  tokenName,
  tokenSymbol,
  supplyCap,
  maxSupply,
  address,
  ...props
}: IVestingContractProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      <div>
        <label>
          <span>Token name</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{tokenName}</p>
      </div>
      <div>
        <label>
          <span>Token symbol</span>
        </label>
        <Chip label={tokenSymbol} rounded size="small" color="gray" />
      </div>
      <div>
        <label>
          <span>Supply cap</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{supplyCap}</p>
      </div>
      <div>
        <label>
          <span>Maximum supply</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">
          {!maxSupply && supplyCap === 'UNLIMITED' ? 'Unlimited' : formatNumber(maxSupply)}
        </p>
      </div>
      <div>
        <label>
          <span>Contract address</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{address}</p>
      </div>
    </div>
  );
};

export default ContractOverview;
