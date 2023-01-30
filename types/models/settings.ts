export interface ITeamManagement {
  name: string;
  email: string;
  type: string;
}

export enum ITeamRole {
  Founder = 'founder',
  Manager = 'manager',
  Investor = 'investor',
  Employee = 'employee',
  Advisor = 'advisor',
  Community = 'community',
  Partner = 'partner',
  Other = 'anonymous'
}
