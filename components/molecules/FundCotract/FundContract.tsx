import React from 'react';
import { formatNumber } from 'utils/token';

interface IFundContractProps {
  address: string;
  amount: string;
}

const FundContract: React.FC<IFundContractProps> = ({ address, amount, ...props }) => {
  return (
    <div className="flex gap-3">
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
        <p className="paragraphy-tiny-medium neutral-text">{amount}</p>
      </div>
    </div>
  );
};

export default FundContract;
