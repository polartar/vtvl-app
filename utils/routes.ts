import { Route } from 'hooks/useRoleGuard';
import { IUserType } from 'types/models/member';

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
export const guestRoles: IUserType[] = ['anonymous', ''];

export const platformRoutes: Route[] = [
  // Initial routes
  // { path: '/', allowedRoles: [...allRoles] },
  // { path: '/404', allowedRoles: [...allRoles] },
  // Onboarding routes
  // { path: '/onboarding', allowedRoles: [...allRoles] },
  { path: '/onboarding/account-setup', allowedRoles: ['founder'] },
  { path: '/onboarding/connect-wallet', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/login', allowedRoles: [...guestRoles] },
  // { path: '/onboarding/member-login', allowedRoles: [...guestRoles] },
  { path: '/onboarding/new-safe', allowedRoles: ['founder'] },
  { path: '/onboarding/select-user-type', allowedRoles: [...guestRoles] },
  { path: '/onboarding/setup-safe-success', allowedRoles: ['founder'] },
  { path: '/onboarding/setup-safes', allowedRoles: ['founder'] },
  // { path: '/onboarding/sign-up', allowedRoles: [...guestRoles] },
  // Dashboard routes
  { path: '/dashboard', allowedRoles: [...managerRoles] },
  { path: '/dashboard/import-token', allowedRoles: ['founder'] },
  { path: '/dashboard/mint-supply', allowedRoles: ['founder'] },
  { path: '/dashboard/vesting-summary', allowedRoles: ['founder'] },
  // Minting routes
  { path: '/minting-token', allowedRoles: ['founder'] },
  { path: '/minting-token/summary', allowedRoles: ['founder'] },
  { path: '/minting-token/complete', allowedRoles: ['founder'] },
  // Contract routes
  { path: '/contracts', allowedRoles: ['founder'] },
  { path: '/contracts/[contract]', allowedRoles: ['founder'] }, // Check later
  // Vesting schedule routes
  { path: '/vesting-schedule', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/[scheduleId]', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/add-recipients', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/configure', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/success', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/summary', allowedRoles: [...managerRoles] },
  { path: '/vesting-schedule/upload-csv', allowedRoles: [...managerRoles] },
  // Cap table routes
  { path: '/cap-table', allowedRoles: ['founder', 'manager2'] },
  // Claim portal routes
  { path: '/claim-portal', allowedRoles: [...recipientRoles, 'manager2'] },
  // Notification routes
  { path: '/notifications', allowedRoles: ['founder'] },
  // Switch to investor routes
  { path: '/switch-role', allowedRoles: ['founder'] },
  // Settings routes
  { path: '/settings', allowedRoles: ['founder'] },
  // Recipient routes
  { path: '/recipient', allowedRoles: ['founder'] },
  { path: '/recipient/create', allowedRoles: ['founder'] },
  { path: '/recipient/confirm', allowedRoles: ['founder'] },
  { path: '/recipient/schedule', allowedRoles: ['founder'] },
  // Other routes
  // { path: '/privacy-policy', allowedRoles: [...allRoles] },
  // { path: '/terms', allowedRoles: [...allRoles] },
  { path: '/vtvl-test-playground', allowedRoles: ['admin'] },
  { path: '/welcome', allowedRoles: [...recipientRoles] }
];
