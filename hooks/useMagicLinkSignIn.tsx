import useAuth from '@api-hooks/useAuth';
import useOrganization from '@api-hooks/useOrganization';
import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { useOnboardingContext } from '@providers/onboarding.context';
import { USE_NEW_API } from '@utils/constants';
import { toUTCString } from '@utils/date';
import { SIGN_MESSAGE_TEMPLATE } from '@utils/web3';
import { useWeb3React } from '@web3-react/core';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { IMember } from 'types/models';

/**
 * This hook is to be used on ALL MAGIC LINK ENTRY points in the app
 * Example of this is the dashboard where the user can come from a magic link pointing to this as a redirect
 * carrying the email address and some auth codes for verification.
 *
 * Current entry points that exist are:
 * - /dashboard -- (/pages/dashboard/index.tsx)
 * - /onboarding/select-user-type -- (/pages/onboarding/select-user-type.tsx)
 * - /recipient/create -- (/pages/recipient/create.tsx)
 * - /member -- (/pages/member.tsx)
 * But, it has an issue during the sign in where the states don't update as quickly as
 * possible before the role and auth guard kicks in.
 *
 * To solve this, we created a /magic-link-verification page that will serve as the main
 * entry point for all magic links. Doing so, will give the app the right flow to sign the
 * user in and update the states before redirecting the user to the correct home page
 * (dashboard / select user type / recipient create / member) before the role and auth guard executes.
 *
 * This can also be used to other entry point in the future if any case we need to create more.
 */

export default function useMagicLinkSignIn(callback?: () => void) {
  const {
    website: { features, organizationId: webOrgId }
  } = useGlobalContext();
  const { emailSignUp } = useAuthContext();
  const { completeOnboarding } = useOnboardingContext();
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);
  let timeout: NodeJS.Timeout;
  const { validateVerificationCode, connectWallet } = useAuth();
  const { getOrganizations } = useOrganization();
  const { active, account, library } = useWeb3React();

  const signInWithMagicLink = async (member: IMember, newUser: boolean) => {
    try {
      await emailSignUp(member, window.location.toString());
      if (!newUser) completeOnboarding();
      if (callback) callback();
      const params: any = new URL(window.location.toString());
      const redir = params.searchParams.get('redir');
      // Redirect to the declared page
      router.push(decodeURIComponent(redir) || '/404');
    } catch (error) {
      setIsExpired(true);
    }
  };

  const useOldAPISigning = async () => {
    // Sign in when found
    const params: any = new URL(window.location.toString());
    const name = params.searchParams.get('name');
    const orgId = webOrgId && features?.auth?.organizationOnly ? webOrgId : params.searchParams.get('orgId');
    const email = params.searchParams.get('email')?.replace(' ', '+');
    const newUser: boolean = params.searchParams.get('newUser');
    const member: IMember = { email };
    if (name) member.name = name;
    if (orgId) member.org_id = orgId;
    if (name || orgId) member.companyEmail = email;
    if (email) {
      await signInWithMagicLink(member, newUser);
    }
  };

  const useNewAPISigning = async () => {
    console.log('USING NEW API for login', account, library);
    // Sign in when found
    const params: any = new URL(window.location.toString());
    const email = params.searchParams.get('email')?.replace(' ', '+');
    const code = params.searchParams.get('code');
    if (!library || !account) return;
    if (email) {
      try {
        const validation = await validateVerificationCode({ code, email });
        console.log('VALIDATING', validation);
        if (validation && active && account) {
          // Should be doing the wallet signing
          const currentDate = toUTCString(new Date());
          const signature = await library.provider.request({
            method: 'personal_sign',
            params: [SIGN_MESSAGE_TEMPLATE(account, currentDate), account]
            // jsonrpc: '2.0'
          });

          console.log('SIGNATURE BEFORE CONNECT WALLET', signature);
          await connectWallet({ address: account, signature, utcTime: currentDate });
          // Redirect to the declared page
          // Ensure wallet is validated
          // Identify which url should the user be redirected to based on his/her current role
          // Probably get the details of the user and check there
          await getOrganizations();
          // router.push('/dashboard');
        } else throw validation;
      } catch (err) {
        console.log('ERROR', err);
        setIsExpired(true);
      }
    }
  };

  const initializeMagicLinkSigning = async () => {
    if (USE_NEW_API) useNewAPISigning();
    else useOldAPISigning();
  };

  useEffect(() => {
    console.log('USE EFFECT YOW', account, library);
    // Ensure that initialization only happens once by debouncing it
    timeout = setTimeout(initializeMagicLinkSigning, 600);
    return () => {
      clearTimeout(timeout);
    };
  }, [account, library]);

  return { isExpired };
}
