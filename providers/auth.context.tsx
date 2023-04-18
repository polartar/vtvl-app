import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
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
import { ILocalStorage } from 'interfaces/locaStorage';
import Router from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMember, fetchMemberByEmail, newMember } from 'services/db/member';
import { createOrg, fetchOrg, fetchOrgByQuery, updateOrg } from 'services/db/organization';
import { fetchRecipientByQuery, fetchRecipientsByQuery } from 'services/db/recipient';
import { createOrUpdateSafe, fetchSafeByQuery, fetchSafesByQuery } from 'services/db/safe';
import { getSafeInfo } from 'services/gnosois';
import { IMember, IOrganization, IRecipientDoc, ISafe, IUser } from 'types/models';
import { IUserType } from 'types/models/member';
import { compareAddresses } from 'utils';
import { CACHE_KEY } from 'utils/constants';
import { getCache, setCache } from 'utils/localStorage';

export type NewLogin = {
  isFirstLogin: boolean;
  isOnboarding: boolean;
  uuid: string;
};

export type TConnections = 'metamask' | 'walletconnect';

export type AuthContextData = {
  isAuthenticated: boolean;
  switchRole?: IUserType;
  setSwitchRole: (role: IUserType) => void;
  user: IUser | undefined;
  currentSafe: ISafe | undefined;
  currentSafeId: string;
  safes: { id: string; data: ISafe }[];
  organizationId: string | undefined;
  connection?: TConnections;
  setConnection: (data?: TConnections) => void;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  emailSignUp: (newSignUp: IMember, url: string) => Promise<void>;
  signUpWithToken: (newSignUp: IMember, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  registerNewMember: (
    member: { name: string; email: string; companyEmail: string; type: IUserType },
    org: IOrganization
  ) => Promise<string | undefined>;
  teammateSignIn: (email: string, type: IUserType, orgId: string, url: string) => Promise<void>;
  sendTeammateInvite: (
    email: string,
    type: string,
    userName: string,
    orgName: string,
    orgId?: string,
    memberId?: string
  ) => Promise<void>;
  sendLoginLink: (email: string) => Promise<void>;
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
  fetchSafe: () => void;
  setCurrentSafe: (safe: ISafe | undefined) => void;
  setCurrentSafeId: (v: string) => void;
  agreedOnConsent: boolean;
  setAgreedOnConsent: (data: any) => void;
  setUser: (data: any) => void;
  setOrganizationId: (orgId: string) => void;
  recipient: IRecipientDoc | undefined;
  setRecipient: (data: any) => void;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { chainId, account, library } = useWeb3React();
  const [user, setUser] = useState<IUser | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [currentSafeId, setCurrentSafeId] = useState('');
  const [currentSafe, setCurrentSafe] = useState<ISafe | undefined>();
  const [safes, setSafes] = useState<{ id: string; data: ISafe }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [agreedOnConsent, setAgreedOnConsent] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [showSideBar, setShowSideBar] = useToggle(false);
  const [sidebarIsExpanded, setSidebarIsExpanded, , , forceCollapseSidebar] = useToggle(true);

  const [recipient, setRecipient] = useState<IRecipientDoc>();
  // Stores the connection status whether the user is connected via metamask or other wallets
  const [connection, setConnection] = useState<TConnections | undefined>();

  // User role switching from founder to investor and vice versa
  const [switchRole, setSwitchRole] = useState<IUserType>('');

  // Sets the recipient if it is found
  useEffect(() => {
    if (chainId && user?.memberInfo?.email && user.memberInfo?.type == 'investor') {
      fetchRecipientsByQuery(['email', 'chainId'], ['==', '=='], [user.email, chainId]).then((response) => {
        if (response && response.length > 0) {
          setRecipient(response[0]);
        }
      });
    }
  }, [chainId, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const memberInfo = await fetchMember(user.uid);
        setUser({ ...user, memberInfo });
        if (memberInfo) setIsAuthenticated(true);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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

  const updateAuthState = useCallback(
    async (credential: UserCredential, isGuestMode = false) => {
      const additionalInfo = getAdditionalUserInfo(credential);
      let recipientInfo = await fetchRecipientByQuery('email', '==', String(credential.user.email));
      if (!recipientInfo) {
        recipientInfo = await fetchRecipientByQuery('walletAddress', '==', String(account));
      }

      setIsNewUser(Boolean(additionalInfo?.isNewUser));
      if (additionalInfo?.isNewUser) {
        // If the authorized user is new user
        const payload: IMember = {
          email: credential.user.email ?? '',
          // TODO why companyEmail field is needed?
          companyEmail: credential.user.email ?? '',
          name: credential.user.displayName ?? '',
          wallets: [],
          type: recipientInfo?.data.recipientType ?? isGuestMode ? 'anonymous' : 'founder'
        };

        if (account) {
          payload.wallets!.push({ walletAddress: account, chainId: chainId! });
        }

        if (recipientInfo) {
          // If this user was already registered as a recipient
          payload.org_id = recipientInfo.data.organizationId;
          payload.name = recipientInfo.data.name;
          payload.type = recipientInfo.data.recipientType;
          payload.wallets!.push({
            walletAddress: recipientInfo.data.walletAddress,
            chainId: recipientInfo.data.chainId!
          });

          if (account && !compareAddresses(account, recipientInfo.data.walletAddress)) {
            // TODO add handler if recipient wallet is not matched with current wallet
            // payload.wallets!.push({ walletAddress: recipientInfo.data.walletAddress, chainId: chainId! });
          }
        }

        await newMember(credential.user.uid, payload);
      }

      const memberInfo = await fetchMember(credential.user.uid);
      setOrganizationId(memberInfo?.org_id);
      setUser({ ...credential.user, memberInfo });
      setIsAuthenticated(true);

      return {
        isNewUser: Boolean(additionalInfo?.isNewUser),
        isOnboarding: Boolean(recipientInfo)
      };
    },
    [account, chainId]
  );

  const signInWithGoogle = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);

    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const { isNewUser: isFirstLogin, isOnboarding } = await updateAuthState(credential);

    setLoading(false);
    return { isFirstLogin, isOnboarding, uuid: credential.user.uid };
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
    member: { name: string; email: string; companyEmail: string; type: IUserType },
    org: IOrganization
  ): Promise<string | undefined> => {
    setLoading(true);
    if (!user) throw new Error('please sign in to setup your account');

    const existingOrg = await fetchOrgByQuery('email', '==', user?.email || '');
    let orgId;
    if (existingOrg?.id) {
      await updateOrg({ name: org.name, email: org.email, user_id: user?.uid }, existingOrg.id);
    } else {
      orgId = await createOrg({ name: org.name, email: org.email, user_id: user?.uid });
    }
    const org_id = existingOrg?.id || orgId;
    const memberInfo: IMember = {
      email: member.email || '',
      companyEmail: member.email || user.email || '',
      name: member.name || user.displayName || '',
      type: member.type,
      org_id,
      joined: Math.floor(new Date().getTime() / 1000)
    };

    if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];

    await newMember(user.uid, { ...memberInfo });
    setOrganizationId(org_id);
    setUser({ ...user, memberInfo });
    setIsAuthenticated(true);
    setIsNewUser(true);
    setLoading(false);
    return org_id || '';
  };

  const emailSignUp = async (newSignUp: IMember, url?: string): Promise<void> => {
    setLoading(true);
    // first time user
    await setPersistence(auth, browserSessionPersistence);

    const isValidLink = isSignInWithEmailLink(auth, url || '');
    if (!isValidLink || !newSignUp.email) throw new Error('invalid sign url');

    const credential = await signInWithEmailLink(auth, newSignUp.email, url);
    const additionalInfo = getAdditionalUserInfo(credential);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);

    const member = await fetchMember(credential.user.uid);
    const memberInfo = member
      ? // Updating the type to support email invites on team member management.
        // By default uses the current user type of the member logging in.
        { ...member, type: newSignUp.type || member.type }
      : // Next block is used when a new user is detected.
        {
          email: newSignUp.email || credential.user.email || '',
          companyEmail: newSignUp.email || credential.user.email || '',
          name: newSignUp.name || credential.user.displayName || '',
          type: newSignUp.type,
          org_id: newSignUp.org_id
        };

    if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];
    await newMember(credential.user.uid, {
      ...memberInfo
    });
    setUser({ ...credential.user, memberInfo });
    setIsAuthenticated(true);

    setLoading(false);
  };

  const signUpWithToken = async (newSignUp: IMember, token: string) => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);
    const credential = await signInWithCustomToken(auth, token);

    if (!credential.user.email) {
      try {
        await updateEmail(credential.user, newSignUp.email || '');
      } catch (err) {
        // TODO handle this error in the future
        console.log(err);
      }
    }

    const additionalInfo = getAdditionalUserInfo(credential);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    const member = await fetchMember(credential.user.uid);
    const memberInfo = member
      ? {
          ...member,
          type: newSignUp.type
        }
      : {
          email: newSignUp.email || credential.user.email || '',
          companyEmail: newSignUp.email || credential.user.email || '',
          name: newSignUp.name || credential.user.displayName || '',
          type: newSignUp.type,
          org_id: newSignUp.org_id
        };

    if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];
    await newMember(credential.user.uid, {
      ...memberInfo
    });
    setUser({ ...credential.user, memberInfo });
    setIsAuthenticated(true);

    setLoading(false);
  };

  const teammateSignIn = async (email: string, type: IUserType, orgId: string, url?: string): Promise<void> => {
    setLoading(true);
    // first time user
    await setPersistence(auth, browserSessionPersistence);

    const isValidLink = isSignInWithEmailLink(auth, url || '');
    if (!isValidLink || !email) throw new Error('invalid sign url');

    const org = await fetchOrg(orgId);
    if (!org) throw new Error('invalid sign url, no organization');

    const credential = await signInWithEmailLink(auth, email, url);
    const additionalInfo = getAdditionalUserInfo(credential);

    const member = await fetchMember(credential.user.uid);
    const memberInfo = member
      ? member
      : {
          email: credential.user.email || '',
          companyEmail: credential.user.email || '',
          name: credential.user.displayName || '',
          type
        };

    if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];

    await newMember(credential.user.uid, {
      ...memberInfo,
      type
    });

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    setUser({ ...credential.user, memberInfo });
    setIsAuthenticated(true);
    setLoading(false);
  };

  const sendLoginLink = async (email: string): Promise<void> => {
    setLoading(true);
    const member = await fetchMemberByEmail(email);
    //TODO: abstract api calls
    await axios.post('/api/email/login', {
      email,
      newUser: member ? false : true
    });
    setLoading(false);
  };

  const sendTeammateInvite = async (
    email: string,
    type: string,
    name: string,
    orgName: string,
    orgId?: string,
    memberId?: string
  ): Promise<void> => {
    setLoading(true);
    //TODO: extract api calls
    await axios.post(`/api/email/teammate-invite`, {
      email,
      type,
      orgId,
      orgName,
      name,
      memberId
    });
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

    setUser({ ...credential.user, memberInfo: { type: 'anonymous', name: 'anonymous', org_id: '' } });
    setIsAuthenticated(true);

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);

    setLoading(false);
    return { isFirstLogin: Boolean(additionalInfo?.isNewUser), isOnboarding: false, uuid: credential.user.uid };
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const memberInfo = await fetchMember(user.uid);
    if (memberInfo) {
      setUser({ ...user, memberInfo });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setUser(undefined);
    setIsAuthenticated(false);
    Router.replace('/onboarding');
  }, []);

  const fetchSafe = useCallback(() => {
    if (organizationId) {
      fetchSafesByQuery(['org_id'], ['=='], [organizationId]).then((res) => setSafes(res));
    }
  }, [organizationId]);

  const memoedValue = useMemo(
    () => ({
      isAuthenticated,
      switchRole,
      setSwitchRole,
      user,
      currentSafe,
      currentSafeId,
      safes,
      organizationId,
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
      sendLoginLink,
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
      fetchSafe,
      setCurrentSafe,
      setCurrentSafeId,
      agreedOnConsent,
      setAgreedOnConsent,
      setUser,
      setOrganizationId,
      recipient,
      setRecipient
    }),
    [
      isAuthenticated,
      user,
      loading,
      error,
      isNewUser,
      showSideBar,
      sidebarIsExpanded,
      organizationId,
      currentSafe,
      agreedOnConsent,
      connection,
      currentSafeId,
      safes
    ]
  );

  useEffect(() => {
    if (
      user &&
      user.memberInfo &&
      user.memberInfo.type &&
      user.memberInfo.type !== 'founder' &&
      user.memberInfo.type !== 'manager' &&
      user.memberInfo.type !== 'manager2'
    ) {
      if (user.memberInfo.type === 'investor' && (!recipient || (recipient && !recipient.data.walletAddress))) {
        Router.push('/recipient/schedule');
      } else {
        Router.push('/claim-portal');
      }

      return;
    }
    if (user && user.email && user.uid) {
      setOrganizationId(user?.memberInfo?.org_id);
    }
  }, [user, recipient]);

  useEffect(() => {
    fetchSafe();
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
      if (!currentSafe.safeNonce && currentSafe.safeNonce !== 0) {
        getSafeInfo(library, currentSafe.address).then((safeWallet) => {
          safeWallet?.getNonce().then((nonce) => {
            createOrUpdateSafe(
              {
                ...currentSafe,
                safeNonce: nonce
              },
              currentSafeId
            );
            setCurrentSafe((s) => (s ? { ...s, safeNonce: nonce } : undefined));
          });
        });
      }
    }
  }, [currentSafe, library, currentSafeId]);

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuthContext = () => ({
  ...useContext(AuthContext)
});
