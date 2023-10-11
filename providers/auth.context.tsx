import useOrgAPI from '@api-hooks/useOrganization';
import useSafeAPI from '@api-hooks/useSafe';
import RecipientApiService from '@api-services/RecipientApiService';
import { useAuth } from '@store/useAuth';
import { useOrganization } from '@store/useOrganizations';
import { useUser } from '@store/useUser';
import { REDIRECT_URIS } from '@utils/constants';
import { transformOrganization } from '@utils/organization';
import { transformSafes } from '@utils/safe';
import { useWeb3React } from '@web3-react/core';
import {
  GoogleAuthProvider,
  UserCredential,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  isSignInWithEmailLink,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  updateEmail
} from 'firebase/auth';
import useToggle from 'hooks/useToggle';
import Router, { useRouter } from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { auth } from 'services/auth/firebase';
import { fetchMember, fetchMemberByEmail, newMember } from 'services/db/member';
import { createOrg, fetchOrg, fetchOrgByQuery, updateOrg } from 'services/db/organization';
import { fetchSafes } from 'services/gnosois';
import { IMember, IOrganization, IRecipient, ISafe, IUser } from 'types/models';
import { IRole, ITeamRole } from 'types/models/settings';
import { compareAddresses } from 'utils';
import { getCache, setCache } from 'utils/localStorage';
import { MESSAGES } from 'utils/messages';
import { platformRoutes } from 'utils/routes';

import { useGlobalContext } from './global.context';
import { useOnboardingContext } from './onboarding.context';

export type NewLogin = {
  isFirstLogin: boolean;
  isOnboarding: boolean;
  uuid: string;
};

export type TConnections = 'metamask' | 'walletconnect';

export type AuthContextData = {
  isAuthenticated: boolean;
  roleOverride?: IRole;
  authenticateUser: (user: IUser, role?: IRole) => void;
  switchRole: (role: IRole) => void;
  user: IUser | undefined;
  currentSafe: ISafe | undefined;
  currentSafeId: string;
  safes: { id: string; data: ISafe }[];
  safesFromChain: string[];
  safesChainDB: { id: string; data: ISafe; isImported: boolean }[];
  organizationId?: string;
  organization?: IOrganization;
  connection?: TConnections;
  setConnection: (data?: TConnections) => void;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  emailSignUp: (newSignUp: IMember, url: string) => Promise<void>;
  signUpWithToken: (newSignUp: IMember, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  registerNewMember: (
    member: { name: string; email: string; companyEmail: string; type: IRole },
    org: IOrganization
  ) => Promise<string | undefined>;
  teammateSignIn: (email: string, type: IRole, orgId: string, url: string) => Promise<void>;
  sendTeammateInvite: (email: string, type: IRole | ITeamRole, userName: string, orgId: string) => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
  logOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string;
  showSideBar: boolean;
  sidebarIsExpanded: boolean;
  toggleSideBar: () => void;
  expandSidebar: () => void;
  forceCollapseSidebar: () => void;
  fetchSafeFromDB: () => void;
  fetchAllSafes: () => void;
  setCurrentSafe: (safe: ISafe | undefined) => void;
  setCurrentSafeId: (v: string) => void;
  agreedOnConsent: boolean;
  setAgreedOnConsent: (data: any) => void;
  setUser: (data: any) => void;
  setOrganizationId: (orgId: string) => void;
  recipient: IRecipient | undefined;
  setOrganization: (organization: IOrganization) => void;
  setRecipient: (data: any) => void;
  allowSignIn: (userOrgId: string) => boolean;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { chainId, account, library } = useWeb3React();
  const [user, setUser] = useState<IUser | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [organization, setOrganization] = useState<IOrganization | undefined>();
  const [currentSafeId, setCurrentSafeId] = useState('');
  const [currentSafe, setCurrentSafe] = useState<ISafe | undefined>();
  const [safes, setSafes] = useState<{ id: string; data: ISafe }[]>([]);
  const [safesFromChain, setSafesFromChain] = useState<string[]>([]);
  const [safesChainDB, setSafesChainDB] = useState<{ id: string; data: ISafe; isImported: boolean }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [agreedOnConsent, setAgreedOnConsent] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [showSideBar, setShowSideBar] = useToggle(false);
  const [sidebarIsExpanded, setSidebarIsExpanded, , , forceCollapseSidebar] = useToggle(true);
  const {
    website: { organizationId: websiteOrganizationId, name: websiteName, email: websiteEmail, features },
    emailTemplate
  } = useGlobalContext();

  const [recipient, setRecipient] = useState<IRecipient>();
  // Stores the connection status whether the user is connected via metamask or other wallets
  const [connection, setConnection] = useState<TConnections | undefined>();

  // User role switching from founder to investor and vice versa
  const [roleOverride, setRoleOverride] = useState<IRole>(IRole.ANONYMOUS);

  // Adds the auth and role guard here

  const { inProgress, completeOnboarding } = useOnboardingContext();
  const router = useRouter();

  const { clear: clearAuth } = useAuth();
  const { clear: clearUser, ...userStore } = useUser();
  const { clear: clearOrg, organizations } = useOrganization();
  const { getSafeWalletsByOrganization } = useSafeAPI();
  const { inviteMember } = useOrgAPI();

  const [organizationName, setOrganizationName] = useState('');

  // Function used to fetch all safes from chain and on DB
  const fetchAllSafes = async () => {
    if (library && account && chainId) {
      try {
        const resp = await fetchSafes(library, account, chainId);
        console.log('fetched safes here ', resp);
        if (resp) setSafesFromChain(resp.safes);
      } catch (error) {
        console.error(error);
        // setImportSafeError((error as any).message);
      }

      // Get safes from db as well
      await fetchSafeFromDB();
    }
  };

  // Gets the combined safes list based on chain and db records
  useEffect(() => {
    if (safesFromChain?.length || safes?.length) {
      const existingSafes = safes.map((s) => s.data.address);
      const safesToAdd = safesFromChain?.length
        ? safesFromChain
            .filter((address) => !existingSafes.includes(address))
            .map((address) => ({ id: address, data: { safe_name: '', address } as ISafe }))
        : [];
      setSafesChainDB([
        ...safes.map((s) => ({ ...s, isImported: true })),
        ...safesToAdd.map((s) => ({ ...s, isImported: false }))
      ]);
    }
  }, [safes, safesFromChain]);

  // Sets the recipient if it is found
  useEffect(() => {
    if (chainId && user?.memberInfo?.email && user.memberInfo?.role == IRole.INVESTOR) {
      // fetchRecipientsByQuery(['email', 'chainId'], ['==', '=='], [user.email, chainId]).then((response) => {
      //   if (response && response.length > 0) {
      //     setRecipient(response[0]);
      //   }
      // });
      RecipientApiService.getRecipients(`email=${user.email}&chainId=${chainId}`).then((response) => {
        if (response && response.length > 0) {
          setRecipient(response[0]);
        }
      });
    }
  }, [chainId, user]);

  // This is used to determine which icons or assets to use across the app,
  // especially on Funding Contract and Transaction Modals.
  // Will surely update and refactor this function later as we add in
  // more wallet options like coinbase and ledger.
  useEffect(() => {
    // Checks the library object if it uses a metamask or other connector type
    if (library && library.connection && library.connection.url) {
      switch (library.connection.url) {
        case 'metamask':
          setConnection('metamask');
          break;
        case 'eip-1193:':
          setConnection('walletconnect');
          break;
        default:
          break;
      }
    }
  }, [library]);

  // Switch role feature
  const switchRole = async (newRole: IRole) => {
    setRoleOverride(newRole);

    const updatedAuthData = { roleOverride: newRole };
    // Update setCache for persistency
    await setCache(updatedAuthData);
    // Update the global state for the auth and role -- automatically redirects the user.
    router.push(newRole === IRole.INVESTOR ? REDIRECT_URIS.CLAIM : REDIRECT_URIS.MAIN);
  };

  // A function to abstract all authentication from different authentication methods
  const authenticateUser = useCallback(
    async (user: IUser, role?: IRole) => {
      await setCache({ user: user, isAuthenticated: true });
      // Condition is used because a possible value is blank '' from IRole
      if (role !== undefined) {
        setRoleOverride(role);
        await setCache({ roleOverride: role });
      }
      const findOrganization = organizations.find((org) => org.organizationId === user?.memberInfo?.org_id);
      setOrganizationId(user?.memberInfo?.org_id);
      setOrganization(findOrganization ? transformOrganization(findOrganization) : undefined);
      setUser(user);
      setIsAuthenticated(true);
    },
    [organizations]
  );

  const allowSignIn = (userOrganizationId?: string) => {
    // Used this kind of conditions for readability
    // Allow sign in when:
    if (features?.auth?.organizationOnly) {
      // - Website is white-labelled + (user is member of organization OR user is currently registering)
      if (
        !websiteOrganizationId ||
        (websiteOrganizationId && (websiteOrganizationId === userOrganizationId || !userOrganizationId))
      )
        return true;
      // - white-labelled but user is not a member
      return false;
    }
    // - Website is not white-labelled, allow all forms of sign in email sending
    return true;
  };

  const updateAuthState = useCallback(
    async (credential: UserCredential, isGuestMode = false) => {
      const additionalInfo = getAdditionalUserInfo(credential);
      // let recipientInfo = await fetchRecipientByQuery('email', '==', String(credential.user.email));
      let recipients = await RecipientApiService.getRecipients(`email=${credential.user.email}`);
      if (!recipients || recipients.length === 0) {
        // recipientInfo = await fetchRecipientByQuery('walletAddress', '==', String(account));
        recipients = await RecipientApiService.getRecipients(`address=${account}`);
      }

      const recipient = recipients.length === 0 ? undefined : recipients[0];

      setIsNewUser(Boolean(additionalInfo?.isNewUser));
      if (additionalInfo?.isNewUser) {
        // If the authorized user is new user
        const payload: IMember = {
          email: credential.user.email ?? '',
          // TODO why companyEmail field is needed?
          companyEmail: credential.user.email ?? '',
          name: credential.user.displayName ?? '',
          wallets: [],
          role: recipient?.role ?? isGuestMode ? IRole.ANONYMOUS : IRole.FOUNDER
        };

        if (account) {
          payload.wallets!.push({ walletAddress: account, chainId: chainId! });
        }

        if (recipient) {
          // If this user was already registered as a recipient
          payload.org_id = recipient.organizationId;
          payload.name = recipient.name;
          payload.role = recipient.role as IRole;
          payload.wallets!.push({
            walletAddress: recipient.address,
            chainId: recipient.chainId!
          });

          if (account && !compareAddresses(account, recipient.address)) {
            // TODO add handler if recipient wallet is not matched with current wallet
            // payload.wallets!.push({ walletAddress: recipientInfo.data.walletAddress, chainId: chainId! });
          }
        }

        await newMember(credential.user.uid, payload);
      }

      const memberInfo = await fetchMember(credential.user.uid);
      if (allowSignIn(memberInfo?.org_id)) {
        authenticateUser({ ...credential.user, memberInfo });

        return {
          isNewUser: Boolean(additionalInfo?.isNewUser) || !memberInfo?.org_id,
          isOnboarding: Boolean(recipient)
        };
      }
      toast.error(MESSAGES.AUTH.FAIL.INVALID_ORGANIZATION);
      return false;
    },
    [account, chainId]
  );

  const signInWithGoogle = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);

    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const authState = await updateAuthState(credential);

    setLoading(false);
    if (authState) {
      const { isNewUser: isFirstLogin, isOnboarding } = authState;
      return { isFirstLogin, isOnboarding, uuid: credential.user.uid };
    }
    return;
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);

    await updateAuthState(credential);
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateAuthState(credential);
    setLoading(false);
  };

  const registerNewMember = async (
    member: { name: string; email: string; companyEmail: string; type: IRole },
    org: IOrganization
  ): Promise<string | undefined> => {
    setLoading(true);
    if (!user) throw new Error('please sign in to setup your account');

    const existingOrg = await fetchOrgByQuery('email', '==', user?.email || '');
    let orgId;
    if (features?.auth?.organizationOnly && websiteOrganizationId) {
      // If the website is white-labelled and has enabled login by organization, use it as the organizationId.
      orgId = websiteOrganizationId;
    } else if (existingOrg?.id) {
      // for existing VTVL organizations, just use and update the organization details.
      await updateOrg({ name: org.name, email: org.email, user_id: user?.uid }, existingOrg.id);
    } else {
      // for new VTVL organizations
      orgId = await createOrg({ name: org.name, email: org.email, user_id: user?.uid });
    }
    const org_id = existingOrg?.id || orgId;

    // If logged in user is not the member of organization
    if (allowSignIn(org_id)) {
      const memberInfo: IMember = {
        email: member.email || '',
        companyEmail: member.email || user.email || '',
        name: member.name || user.displayName || '',
        role: member.type,
        org_id,
        joined: Math.floor(new Date().getTime() / 1000)
      };

      if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];

      await newMember(user.uid, { ...memberInfo });
      authenticateUser({ ...user, memberInfo: { ...memberInfo, org_id } });
      setIsNewUser(true);
      setLoading(false);
      return org_id || '';
    } else {
      toast.error(MESSAGES.AUTH.FAIL.INVALID_ORGANIZATION);
    }
  };

  const emailSignUp = async (newSignUp: IMember, url?: string): Promise<void> => {
    setLoading(true);
    // first time user
    await setPersistence(auth, browserSessionPersistence);

    const isValidLink = isSignInWithEmailLink(auth, url || '');
    if (!isValidLink || !newSignUp.email) throw new Error('invalid sign url');

    const credential = await signInWithEmailLink(auth, newSignUp.email, url);

    // If logged in user is not the member of organization
    if (allowSignIn(newSignUp.org_id)) {
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);

      const member = await fetchMember(credential.user.uid);
      const memberInfo = member
        ? // Updating the type to support email invites on team member management.
          // By default uses the current user type of the member logging in.
          { ...member, type: newSignUp.role || member.role }
        : // Next block is used when a new user is detected.
          {
            email: newSignUp.email || credential.user.email || '',
            companyEmail: newSignUp.email || credential.user.email || '',
            name: newSignUp.name || credential.user.displayName || '',
            type: newSignUp.role,
            org_id: newSignUp.org_id
          };

      if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];
      await newMember(credential.user.uid, {
        ...memberInfo
      });
      authenticateUser({ ...credential.user, memberInfo });
    } else {
      toast.error(MESSAGES.AUTH.FAIL.INVALID_ORGANIZATION);
    }

    setLoading(false);
  };

  const signUpWithToken = async (newSignUp: IMember, token: string) => {
    // If logged in user is not the member of organization
    if (allowSignIn(newSignUp.org_id)) {
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithCustomToken(auth, token);

      if (!credential.user.email) {
        try {
          await updateEmail(credential.user, newSignUp.email || '');
        } catch (err) {
          /// We should handle this error in the future
          console.log(err);
        }
      }
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
      const member = await fetchMember(credential.user.uid);
      const memberInfo = member
        ? {
            ...member,
            role: newSignUp.role
          }
        : {
            email: newSignUp.email || credential.user.email || '',
            companyEmail: newSignUp.email || credential.user.email || '',
            name: newSignUp.name || credential.user.displayName || '',
            role: newSignUp.role,
            org_id: newSignUp.org_id
          };

      if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];
      await newMember(credential.user.uid, {
        ...memberInfo
      });
      authenticateUser({ ...credential.user, memberInfo });
      setLoading(false);
    } else {
      toast.error(MESSAGES.AUTH.FAIL.INVALID_ORGANIZATION);
    }
  };

  const teammateSignIn = async (email: string, type: IRole, orgId: string, url?: string): Promise<void> => {
    setLoading(true);
    // first time user
    await setPersistence(auth, browserSessionPersistence);

    const isValidLink = isSignInWithEmailLink(auth, url || '');
    if (!isValidLink || !email) throw new Error('invalid sign url');

    const org = await fetchOrg(orgId);
    if (!org) throw new Error('invalid sign url, no organization');

    // If logged in user is not the member of organization
    if (allowSignIn(orgId)) {
      console.log('user type is ', type);
      const credential = await signInWithEmailLink(auth, email, url);
      const additionalInfo = getAdditionalUserInfo(credential);

      const member = await fetchMember(credential.user.uid);
      const memberInfo = member
        ? member
        : {
            email: credential.user.email || '',
            companyEmail: credential.user.email || '',
            name: credential.user.displayName || '',
            role: type
          };

      if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];

      await newMember(credential.user.uid, {
        ...memberInfo,
        role: type
      });

      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
      authenticateUser({ ...credential.user, memberInfo });
    } else {
      toast.error(MESSAGES.AUTH.FAIL.INVALID_ORGANIZATION);
    }
    setLoading(false);
  };

  const sendTeammateInvite = async (
    email: string,
    type: IRole | ITeamRole,
    name: string,
    orgId: string
  ): Promise<void> => {
    setLoading(true);
    await inviteMember({ email, role: type, redirectUri: REDIRECT_URIS.INVITE_MEMBER, organizationId: orgId, name });
    setLoading(false);
  };

  /**
   * @description Auth platform in guest mode
   *
   * It's not getting or creating the `Member` info from/to database.
   */
  const anonymousSignIn = useCallback(async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    const credential = await signInAnonymously(auth);
    const additionalInfo = getAdditionalUserInfo(credential);
    const userDetails: IUser = {
      ...credential.user,
      memberInfo: { role: IRole.ANONYMOUS, name: 'anonymous', org_id: '' }
    };

    authenticateUser(userDetails);

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);

    setLoading(false);
    return { isFirstLogin: Boolean(additionalInfo?.isNewUser), isOnboarding: false, uuid: credential.user.uid };
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    setLoading(true);
    if (userStore && userStore.userId) {
      const persistedRole = await getCache().roleOverride;
      // Authenticate the user based on the new api implementation
      authenticateUser(
        {
          memberInfo: {
            id: userStore.userId,
            user_id: userStore.userId,
            email: userStore.email,
            name: userStore.name,
            org_id: userStore.organizationId,
            wallets: [{ walletAddress: userStore.walletAddress, chainId: userStore.chainId }],
            role: userStore.role
          }
        } as IUser,
        persistedRole
      );
    }
    setLoading(false);
    return;
  }, []);

  const logOut = async () => {
    clearAuth();
    clearUser();
    clearOrg();

    // remove user state
    setUser(undefined);
    // unauthorize user
    setIsAuthenticated(false);
    // remove associated organizations
    setOrganizationId(undefined);
    setOrganization(undefined);
    // remove persistent user states
    setCache({ user: undefined, roleOverride: undefined, isAuthenticated: undefined });
    // update auth and role guard states

    Router.replace(REDIRECT_URIS.AUTH_LOGIN);
  };

  const fetchSafeFromDB = useCallback(async () => {
    if (organizationId) {
      // Get safe wallets from new API and transform it to the old firebase format
      const safesList = await getSafeWalletsByOrganization(organizationId);
      const transformedSafes = transformSafes({
        safes: safesList,
        organizationId,
        organizationName,
        userId: user?.memberInfo?.id || ''
      });
      setSafes(transformedSafes);
    }
  }, [organizationId]);

  const memoedValue = useMemo(
    () => ({
      isAuthenticated,
      roleOverride,
      authenticateUser,
      switchRole,
      user,
      currentSafe,
      currentSafeId,
      safes,
      safesFromChain,
      safesChainDB,
      organizationId,
      organization,
      connection,
      setConnection,
      signUpWithEmail,
      signInWithEmail,
      signUpWithToken,
      emailSignUp,
      signInWithGoogle,
      anonymousSignIn,
      teammateSignIn,
      sendTeammateInvite,
      registerNewMember,
      loading,
      isNewUser,
      refreshUser,
      logOut,
      error,
      // Remove after implementing context to show/hide the sidebar
      showSideBar,
      sidebarIsExpanded,
      toggleSideBar: setShowSideBar,
      expandSidebar: setSidebarIsExpanded,
      forceCollapseSidebar,
      fetchSafeFromDB,
      fetchAllSafes,
      setCurrentSafe,
      setCurrentSafeId,
      agreedOnConsent,
      setAgreedOnConsent,
      setUser,
      setOrganizationId,
      setOrganization,
      recipient,
      setRecipient,
      allowSignIn
    }),
    [
      isAuthenticated,
      authenticateUser,
      roleOverride,
      user,
      loading,
      error,
      isNewUser,
      showSideBar,
      sidebarIsExpanded,
      organizationId,
      organization,
      currentSafe,
      agreedOnConsent,
      connection,
      currentSafeId,
      safes,
      safesFromChain,
      safesChainDB
    ]
  );

  useEffect(() => {
    // when sign up, we shouldn't redirect to claim portal
    if (agreedOnConsent) return;
    if (
      user &&
      user.memberInfo &&
      user.memberInfo.role &&
      user.memberInfo.role !== IRole.FOUNDER &&
      user.memberInfo.role !== IRole.MANAGER &&
      user.memberInfo.role !== IRole.OPERATOR &&
      !inProgress &&
      !router.asPath.includes('welcome')
    ) {
      if (user.memberInfo.role === IRole.INVESTOR && (!recipient || (recipient && !recipient.address))) {
        Router.push('/recipient/schedule');
      } else if (isNewUser) {
        if (connection === 'metamask') {
          Router.push('/welcome');
        } else {
          completeOnboarding();
        }
      } else if (user.memberInfo.role !== IRole.ANONYMOUS) {
        Router.push('/claim-portal');
      }

      return;
    }
    if (user && user.email && user.uid) {
      setOrganizationId(user?.memberInfo?.org_id);
    }
  }, [user, recipient, agreedOnConsent, connection]);

  useEffect(() => {
    // Update organization name based on organizationId
    const currentOrganization = organizations.find((org) => org.organizationId === organizationId);
    if (currentOrganization && currentOrganization.organization)
      setOrganizationName(currentOrganization.organization.name);

    fetchSafeFromDB();
  }, [organizationId]);

  useEffect(() => {
    if (safes && safes.length > 0) {
      const cache = getCache();
      if (cache?.safeAddress) {
        const safe = safes.find(
          (s) => cache.safeAddress && s.data.address.toLowerCase() === cache.safeAddress.toLowerCase()
        );
        if (safe) {
          setCurrentSafeId(safe.id);
          setCurrentSafe(safe.data);
          return;
        }
      }
      setCurrentSafeId(safes[0].id);
      setCurrentSafe(safes[0].data);
    }
  }, [safes]);

  useEffect(() => {
    if (currentSafe && library && currentSafeId) {
      setCache({ safeAddress: currentSafe.address });
    }
    if (!currentSafe || !currentSafeId) {
      setCache({ safeAddress: '' });
    }
  }, [currentSafe, library, currentSafeId]);

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuthContext = () => ({
  ...useContext(AuthContext)
});
