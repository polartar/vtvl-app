export interface IFundContractProps {
  name?: string;
  logo?: string;
  symbol: string;
  address: string;
  amount: string;
}

export interface IVestingContractDoc {
  id: string;
  data: IVestingContract;
}
