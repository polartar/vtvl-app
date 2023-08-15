import useOrganization from '@api-hooks/useOrganization';
import useUserAPI from '@api-hooks/useUser';
import { useAuthContext } from '@providers/auth.context';
import { getOrgStore } from '@store/useOrganizations';
import { useUser } from '@store/useUser';
import { REDIRECT_URIS } from '@utils/constants';
import { transformOrganization } from '@utils/organization';
import { useWeb3React } from '@web3-react/core';
import { useRouter } from 'next/router';
import { IUser } from 'types/models';
import { IRole } from 'types/models/settings';

/**
 * This function is intended for a global hook that relates to anything for the user.
 * @returns { authorizeUser } function that will save user required data for auth and persistence
 */

export default function useAuth() {
  const { chainId } = useWeb3React();
  const { getUserProfile } = useUserAPI(); // API hook
  const { getOrganizations } = useOrganization(); // API hook
  const { organizations } = getOrgStore(); // Store
  const { save: saveUser } = useUser(); // Store
  const { setOrganizationId, setOrganization, authenticateUser, user } = useAuthContext(); // Old context
  const router = useRouter();

  const authorizeUser = async () => {
    // Get me
    const profile = await getUserProfile();
    console.log('USER PROFILE', profile);
    // Ensure wallet is validated
    // Identify which url should the user be redirected to based on his/her current role
    // Probably get the details of the user and check there
    try {
      const orgs = await getOrganizations();
      if (orgs && orgs.length) {
        // Has an associated organization, there fore is an existing user
        // Change the chainId later to be from the new api
        saveUser({ organizationId: orgs[0].organizationId, role: orgs[0].role, chainId });
        // Use context to save organization id and user information
        setOrganizationId(orgs[0].organizationId);
        setOrganization(transformOrganization(orgs[0]));
        authenticateUser(
          {
            ...user,
            memberInfo: {
              ...user?.memberInfo,
              id: profile.user.id,
              user_id: profile.user.id,
              name: profile.user.name,
              wallets: [{ walletAddress: profile.wallet.address, chainId }],
              org_id: orgs[0].organizationId,
              role: orgs[0].role
            }
          } as IUser,
          orgs[0].role
        );
        router.push(orgs[0].role === IRole.FOUNDER ? REDIRECT_URIS.MAIN : REDIRECT_URIS.CLAIM);
      } else {
        // No associated org, new user
        // redirect to account setup
        // POST /organization
        router.push(REDIRECT_URIS.SETUP_ACCOUNT);
      }
      console.log('useMAGIC organizations', organizations, orgs);
    } catch (err) {
      console.log('ERror organization', err);
    }
  };

  return { authorizeUser };
}