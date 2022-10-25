export interface IToken {
  name: string;
  symbol: string;
  address: string;
  logo: string;
  organization_id: string;
  imported: boolean;
  created_at: number;
  updated_at: number;
  supply_cap: string;
  max_supply?: number;
  initial_supply?: number;
}
