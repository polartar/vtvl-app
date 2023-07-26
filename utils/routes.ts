import { Route } from 'hooks/useRoleGuard';
import { IRole } from 'types/models/settings';

export const allRoles: IRole[] = [
  IRole.FOUNDER,
  IRole.ADMIN,
  IRole.INVESTOR,
  IRole.MANAGER,
  IRole.EMPLOYEE,
  IRole.ADVISOR,
  IRole.ANONYMOUS
];
export const managerRoles: IRole[] = [IRole.ADMIN, IRole.MANAGER];
export const recipientRoles: IRole[] = [IRole.INVESTOR, IRole.EMPLOYEE, IRole.ADVISOR];
export const guestRoles: IRole[] | IRole[] = [IRole.ANONYMOUS];

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
  { path: '/v2/dashboard', allowedRoles: managerRoles, allowedRolesV2: managerRolesV2 },
  { path: '/dashboard', allowedRoles: [...managerRoles], allowedRolesV2: [...managerRolesV2] },
  { path: '/dashboard/import-token', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/dashboard/mint-supply', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/dashboard/vesting-summary', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Minting routes
  { path: '/minting-token', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/minting-token/summary', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/minting-token/complete', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Contract routes
  { path: '/contracts', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/contracts/[contract]', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] }, // Check later
  // Vesting schedule routes
  { path: '/vesting-schedule', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/[scheduleId]', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/add-recipients', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/configure', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/success', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/summary', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  { path: '/vesting-schedule/upload-csv', allowedRoles: [...managerRoles], allowedRolesV2: managerRolesV2 },
  // Cap table routes
  {
    path: '/cap-table',
    allowedRoles: [IRole.FOUNDER, IRole.OPERATOR],
    allowedRolesV2: [IRole.FOUNDER, IRole.OPERATOR]
  },
  // Claim portal routes
  {
    path: '/claim-portal',
    allowedRoles: [...recipientRoles],
    allowedRolesV2: [...recipientRolesV2, IRole.OPERATOR]
  },
  // Notification routes
  { path: '/notifications', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Switch to investor routes
  { path: '/switch-role', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Settings routes
  { path: '/settings', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Recipient routes
  { path: '/recipient', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/create', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/confirm', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  { path: '/recipient/schedule', allowedRoles: [IRole.FOUNDER], allowedRolesV2: [IRole.FOUNDER] },
  // Other routes
  // { path: '/privacy-policy', allowedRoles: [...allRoles] },
  // { path: '/terms', allowedRoles: [...allRoles] },
  { path: '/vtvl-test-playground', allowedRoles: [IRole.ADMIN], allowedRolesV2: [IRole.ADMIN] },
  { path: '/welcome', allowedRoles: [...recipientRoles], allowedRolesV2: recipientRolesV2 }
];
