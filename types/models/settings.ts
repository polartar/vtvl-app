export interface ITeamManagement {
  name: string;
  company: string;
  role: string;
}

export enum ITeamRole {
  Founder = 'founder',
  Manager = 'manager'
}

export interface ITeamRoleType {
  label: string | number;
  value: ITeamRole;
}
