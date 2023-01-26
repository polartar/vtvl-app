export interface ITeamManagement {
  name: string;
  email: string;
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

export interface ITeamTableData {
  name: string;
  email: string;
  role: ITeamRole;
  joinedAt: Date;
}
