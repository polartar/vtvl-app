import { IRole, ITeamRole } from 'types/models/settings';

export type Route = {
  path: string;
  allowedRoles: TRoleGroup;
};

export type TRoleGroup = (IRole | ITeamRole)[];

export const allRoles: TRoleGroup = [
  IRole.FOUNDER,
  IRole.ADMIN,
  IRole.INVESTOR,
  IRole.MANAGER,
  IRole.EMPLOYEE,
  IRole.ADVISOR,
  IRole.ANONYMOUS
];
export const managerRoles: TRoleGroup = [IRole.FOUNDER, IRole.ADMIN, IRole.MANAGER];
export const recipientRoles: TRoleGroup = [IRole.INVESTOR, IRole.EMPLOYEE, IRole.ADVISOR];
export const guestRoles: TRoleGroup = [IRole.ANONYMOUS];

// List of routes in VTVL app.
// Developer may need to add items here if it is protected and new to the platform.
export const platformRoutes: Route[] = [
  // Initial routes
  // { path: '/', allowedRoles: [...allRoles] },
  // { path: '/404', allowedRoles: [...allRoles] },
  // Onboarding routes
  // { path: '/onboarding', allowedRoles: [...allRoles] },
  // { path: '/onboarding/account-setup', allowedRoles: [IRole.FOUNDER] },
  // { path: '/onboarding/connect-wallet', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/login', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/member-login', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/new-safe', allowedRoles: [IRole.FOUNDER] },
  // { path: '/onboarding/select-user-type', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/setup-safe-success', allowedRoles: [IRole.FOUNDER] },
  // { path: '/onboarding/setup-safes', allowedRoles: [IRole.FOUNDER] },
  // { path: '/onboarding/sign-up', allowedRoles: [...guestRoles] },
  // Dashboard routes
  { path: '/v2/dashboard', allowedRoles: managerRoles },
  { path: '/dashboard', allowedRoles: [...managerRoles] },
  { path: '/dashboard/import-token', allowedRoles: [IRole.FOUNDER] },
  { path: '/dashboard/mint-supply', allowedRoles: [IRole.FOUNDER] },
  { path: '/dashboard/vesting-summary', allowedRoles: [IRole.FOUNDER] },
  // Minting routes
  { path: '/minting-token', allowedRoles: [IRole.FOUNDER] },
  { path: '/minting-token/summary', allowedRoles: [IRole.FOUNDER] },
  { path: '/minting-token/complete', allowedRoles: [IRole.FOUNDER] },
  // Contract routes
  { path: '/contracts', allowedRoles: [IRole.FOUNDER] },
  { path: '/contracts/[contract]', allowedRoles: [IRole.FOUNDER] }, // Check later
  // Vesting schedule routes
  { path: '/vesting-schedule', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/[scheduleId]', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/add-recipients', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/configure', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/success', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/summary', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/upload-csv', allowedRoles: [...managerRoles] },
  // Cap table routes
  {
    path: '/cap-table',
    allowedRoles: [IRole.FOUNDER, IRole.OPERATOR]
  },
  // Claim portal routes
  {
    path: '/claim-portal',
    allowedRoles: [...recipientRoles]
  },
  // Notification routes
  { path: '/notifications', allowedRoles: [IRole.FOUNDER] },
  // Switch to investor routes
  { path: '/switch-role', allowedRoles: [IRole.FOUNDER] },
  // Settings routes
  { path: '/settings', allowedRoles: [IRole.FOUNDER] },
  // Recipient routes
  { path: '/recipient', allowedRoles: [IRole.FOUNDER] },
  { path: '/recipient/create', allowedRoles: [IRole.FOUNDER] },
  { path: '/recipient/confirm', allowedRoles: [IRole.FOUNDER] },
  { path: '/recipient/schedule', allowedRoles: [IRole.FOUNDER] },
  // Other routes
  // { path: '/privacy-policy', allowedRoles: [...allRoles] },
  // { path: '/terms', allowedRoles: [...allRoles] },
  { path: '/vtvl-test-playground', allowedRoles: [IRole.ADMIN] },
  { path: '/welcome', allowedRoles: [...recipientRoles] }
];
