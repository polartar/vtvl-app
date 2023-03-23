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
import Router from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMember, fetchMemberByEmail, newMember } from 'services/db/member';
import { createOrg, fetchOrg, fetchOrgByQuery, updateOrg } from 'services/db/organization';
import { fetchRecipientByQuery } from 'services/db/recipient';
import { fetchSafeByQuery } from 'services/db/safe';
import { IMember, IOrganization, IRecipientDoc, ISafe, IUser } from 'types/models';
import { compareAddresses } from 'utils';

export type NewLogin = {
  isFirstLogin: boolean;
  isOnboarding: boolean;
  uuid: string;
};

export type TConnections = 'metamask' | 'walletconnect';

export type AuthContextData = {
  user: IUser | undefined;
  safe: ISafe | undefined;
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
    member: { name: string; email: string; companyEmail: string; type: string },
    org: IOrganization
  ) => Promise<string | undefined>;
  teammateSignIn: (email: string, type: string, orgId: string, url: string) => Promise<void>;
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
  setSafe: (safe: ISafe) => void;
  agreedOnConsent: boolean;
  setAgreedOnConsent: (data: any) => void;
  setUser: (data: any) => void;
  setOrganizationId: (orgId: string) => void;
  recipient: IRecipientDoc | undefined;
  setRecipient: (data: any) => void;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const { chainId, account, library } = useWeb3React();
  const [user, setUser] = useState<IUser | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [safe, setSafe] = useState<ISafe | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [agreedOnConsent, setAgreedOnConsent] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [showSideBar, setShowSideBar] = useToggle(false);
  const [sidebarIsExpanded, setSidebarIsExpanded, , , forceCollapseSidebar] = useToggle(true);

  const [recipient, setRecipient] = useState<IRecipientDoc>();
  // Stores the connection status whether the user is connected via metamask or other wallets
  const [connection, setConnection] = useState<TConnections | undefined>();

  useEffect(() => {
    if (recipient && recipient.data && recipient.data.walletAddress) {
      Router.push('/claim-portal');
    }
  }, [recipient]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const memberInfo = await fetchMember(user.uid);
        setUser({ ...user, memberInfo });
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
    member: { name: string; email: string; companyEmail: string; type: string },
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
      name: user.displayName || '',
      type: member.type,
      org_id,
      joined: Math.floor(new Date().getTime() / 1000)
    };

    if (account) memberInfo.wallets = [{ walletAddress: account, chainId: chainId! }];

    await newMember(user.uid, { ...memberInfo });
    setOrganizationId(org_id);
    setUser({ ...user, memberInfo });
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

    setLoading(false);
  };

  const teammateSignIn = async (email: string, type: string, orgId: string, url?: string): Promise<void> => {
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
    }
    setLoading(false);
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setUser(undefined);
    Router.replace('/onboarding');
  }, []);

  const fetchSafe = useCallback(() => {
    if (organizationId) {
      fetchSafeByQuery('org_id', '==', organizationId).then((res) => setSafe(res));
    }
  }, [organizationId]);

  const memoedValue = useMemo(
    () => ({
      user,
      safe,
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
      setSafe,
      agreedOnConsent,
      setAgreedOnConsent,
      setUser,
      setOrganizationId,
      recipient,
      setRecipient
    }),
    [user, loading, error, isNewUser, showSideBar, sidebarIsExpanded, organizationId, safe, agreedOnConsent, connection]
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
      if (user.memberInfo.type === 'investor' && recipient && !recipient.data.walletAddress) {
        Router.push('/recipient/schedule');
      } else {
        Router.push('/claim-portal');
      }

      return;
    }
    if (user && user.email && user.uid) {
      setOrganizationId(user?.memberInfo?.org_id);
    }
  }, [user]);

  useEffect(() => {
    fetchSafe();
  }, [organizationId]);

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuthContext = () => ({
  ...useContext(AuthContext)
});
