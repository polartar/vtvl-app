import Chip from '@components/atoms/Chip/Chip';
import React from 'react';
import { IFundContractProps } from 'types/models/vestingContract';
import { formatNumber } from 'utils/token';

const FundContract: React.FC<IFundContractProps> = ({ symbol, address, amount, ...props }) => {
  return (
    <div className="flex gap-3">
      <div>
        <label>
          <span>Token</span>
        </label>
        <Chip label={symbol} rounded size="small" color="gray" />
      </div>
      <div>
        <label>
          <span>Contract Address</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{address}</p>
      </div>
      <div>
        <label>
          <span>Amount needed</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{formatNumber(+amount)}</p>
      </div>
    </div>
  );
};

export default FundContract;
