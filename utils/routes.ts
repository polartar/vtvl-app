import { Route } from 'hooks/useRoleGuard';
import { IUserType } from 'types/models/member';
import { IRole } from 'types/models/settings';

export const allRoles: IUserType[] = [
  'admin',
  'founder',
  'investor',
  'manager',
  'manager2',
  'employee',
  'advisor',
  'anonymous',
  ''
];
export const managerRoles: IUserType[] = ['founder', 'manager', 'manager2'];
export const recipientRoles: IUserType[] = ['investor', 'employee', 'advisor'];
export const guestRoles: IUserType[] | IRole[] = ['anonymous', ''];

export const allRolesV2: IRole[] = [
  IRole.FOUNDER,
  IRole.ADVISOR,
  IRole.EMPLOYEE,
  IRole.INVESTOR,
  IRole.MANAGER,
  IRole.OPERATOR
];

export const managerRolesV2: IRole[] = [IRole.FOUNDER, IRole.MANAGER, IRole.OPERATOR];
export const recipientRolesV2: IRole[] = [IRole.INVESTOR, IRole.EMPLOYEE, IRole.ADVISOR];

// List of routes in VTVL app.
// Developer may need to add items here if it is protected and new to the platform.
export const platformRoutes: Route[] = [
  // Initial routes
  // { path: '/', allowedRoles: [...allRoles] },
  // { path: '/404', allowedRoles: [...allRoles] },
  // Onboarding routes
  // { path: '/onboarding', allowedRoles: [...allRoles] },
  // { path: '/onboarding/account-setup', allowedRoles: ['founder'] },
  // { path: '/onboarding/connect-wallet', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/login', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/member-login', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/new-safe', allowedRoles: ['founder'] },
  // { path: '/onboarding/select-user-type', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/setup-safe-success', allowedRoles: ['founder'] },
  // { path: '/onboarding/setup-safes', allowedRoles: ['founder'] },
  // { path: '/onboarding/sign-up', allowedRoles: [...guestRoles] },
  // Dashboard routes
  { path: '/v2/dashboard', allowedRoles: managerRoles, allowedRolesV2: managerRolesV2 },
  { path: '/dashboard', allowedRoles: [...managerRoles], allowedRolesV2: [...managerRolesV2] },
  { path: '/dashboard/import-token', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/dashboard/mint-supply', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/dashboard/vesting-summary', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Minting routes
  { path: '/minting-token', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/minting-token/summary', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/minting-token/complete', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Contract routes
  { path: '/contracts', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/contracts/[contract]', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] }, // Check later
  // Vesting schedule routes
  { path: '/vesting-schedule', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/[scheduleId]', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/add-recipients', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/configure', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/success', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/summary', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/upload-csv', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  // Cap table routes
  { path: '/cap-table', allowedRoles: ['founder', 'manager2'], allowedRolesV2: [IRole.FOUNDER, IRole.OPERATOR] },
  // Claim portal routes
  {
    path: '/claim-portal',
    allowedRoles: [...recipientRoles, 'manager2'],
    allowedRolesV2: [...recipientRolesV2, IRole.OPERATOR]
  },
  // Notification routes
  { path: '/notifications', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Switch to investor routes
  { path: '/switch-role', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Settings routes
  { path: '/settings', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Recipient routes
  { path: '/recipient', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/create', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/confirm', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/schedule', allowedRoles: ['founder'], allowedRolesV2: [IRole.FOUNDER] },
  // Other routes
  // { path: '/privacy-policy', allowedRoles: [...allRoles] },
  // { path: '/terms', allowedRoles: [...allRoles] },
  { path: '/vtvl-test-playground', allowedRoles: ['admin'], allowedRolesV2: [IRole.ADMIN] },
  { path: '/welcome', allowedRoles: [...recipientRoles], allowedRolesV2: recipientRolesV2 }
];
