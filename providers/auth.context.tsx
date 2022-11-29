import axios from 'axios';
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  isSignInWithEmailLink,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import useEagerConnect from 'hooks/useEagerConnect';
import Router from 'next/router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMember, fetchMemberByEmail, newMember } from 'services/db/member';
import { createOrg, fetchOrg, fetchOrgByQuery, updateOrg } from 'services/db/organization';
import { fetchSafeByQuery } from 'services/db/safe';
import { IMember, IOrganization, ISafe, IUser } from 'types/models';

export type NewLogin = {
  isFirstLogin: boolean;
  uuid: string;
};

export type AuthContextData = {
  user: IUser | undefined;
  safe: ISafe | undefined;
  organizationId: string | undefined;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  emailSignUp: (newSignUp: IMember, url: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  registerNewMember: (
    member: { name: string; email: string; companyEmail: string; type: string },
    org: IOrganization
  ) => Promise<string | undefined>;
  teammateSignIn: (email: string, type: string, orgId: string, url: string) => Promise<void>;
  sendTeammateInvite: (email: string, type: string, userName: string, orgName: string, orgId?: string) => Promise<void>;
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
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const [user, setUser] = useState<IUser | undefined>();
  // Remove default value when merging to develop, staging or main
  // Mock organizationId MYvgDyXEY5kCfxdIvtY8 or V2dmM9LmDAAgfWgj8PJR or t2SfnLYwU0MZpY4q7zL8 for bico
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [safe, setSafe] = useState<ISafe | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const tried = useEagerConnect();
  const [error, setError] = useState('');
  // Remove after implementing context to show/hide the sidebar
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [sidebarIsExpanded, setSidebarIsExpanded] = useState<boolean>(true);
  console.log({ user });
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

  const signInWithGoogle = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const additionalInfo = getAdditionalUserInfo(credential);
    const memberInfo = await fetchMember(credential.user.uid);
    if (additionalInfo?.isNewUser) {
      await newMember(credential.user.uid, {
        email: credential.user.email || '',
        companyEmail: credential.user.email || '',
        name: credential.user.displayName || ''
      });
    }
    setIsNewUser(additionalInfo?.isNewUser || false);
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMember(credential.user.uid);
    const additionalInfo = getAdditionalUserInfo(credential);
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setIsNewUser(additionalInfo?.isNewUser || false);
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await setPersistence(auth, browserSessionPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMember(credential.user.uid);
    const additionalInfo = getAdditionalUserInfo(credential);
    if (additionalInfo?.isNewUser) {
      await newMember(credential.user.uid, {
        email: credential.user.email || '',
        companyEmail: credential.user.email || '',
        name: credential.user.displayName || ''
      });
    }
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setIsNewUser(additionalInfo?.isNewUser || false);
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

    await newMember(user.uid, memberInfo);
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
      ? member
      : {
          email: newSignUp.email || credential.user.email || '',
          companyEmail: newSignUp.email || credential.user.email || '',
          name: newSignUp.name || credential.user.displayName || '',
          type: newSignUp.type,
          org_id: newSignUp.org_id
        };
    await newMember(credential.user.uid, memberInfo);
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
          type
        };

    await newMember(credential.user.uid, { ...memberInfo, type });

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
  };

  const sendLoginLink = async (email: string): Promise<void> => {
    setLoading(true);
    const member = await fetchMemberByEmail(email);
    console.log('sending login link here ', member);
    //TODO: abstract api calls
    await axios.post(`${window.location.origin || process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/email/login`, {
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
    orgId?: string
  ): Promise<void> => {
    setLoading(true);
    //TODO: extract api calls
    await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/email/teammate-invite`, {
      email,
      type,
      orgId,
      orgName,
      name
    });
    setLoading(false);
  };

  const anonymousSignIn = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    const credential = await signInAnonymously(auth);
    const additionalInfo = getAdditionalUserInfo(credential);
    setUser({ ...credential.user, memberInfo: { type: 'anonymous', name: 'anonymous', org_id: '' } });
    setLoading(false);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const refreshUser = async (): Promise<void> => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const memberInfo = await fetchMember(user.uid);
    if (memberInfo) {
      setUser({ ...user, memberInfo });
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(undefined);
    Router.replace('/onboarding');
  };

  const fetchSafe = async () => {
    if (organizationId) {
      fetchSafeByQuery('org_id', '==', organizationId).then((res) => setSafe(res));
    }
  };

  // Remove after implementing context to show/hide the sidebar
  const toggleSideBar = () => setShowSideBar((prev) => !prev);
  const expandSidebar = () => setSidebarIsExpanded((prev) => !prev);

  const memoedValue = useMemo(
    () => ({
      user,
      safe,
      organizationId,
      signUpWithEmail,
      signInWithEmail,
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
      toggleSideBar,
      expandSidebar,
      forceCollapseSidebar: () => setSidebarIsExpanded(false),
      fetchSafe
    }),
    [user, loading, error, isNewUser, showSideBar, sidebarIsExpanded, organizationId, safe]
  );
  console.log('organzationId - ', organizationId);

  useEffect(() => {
    if (
      user &&
      user.memberInfo &&
      user.memberInfo.type &&
      user.memberInfo.type !== 'founder' &&
      user.memberInfo.type !== 'manager'
    ) {
      Router.push('/tokens');
      return;
    }
    if (user && user.email && user.uid) {
      // console.log('logging auth context user', user);
      // console.log('logging user org_id', user?.memberInfo?.org_id);
      setOrganizationId(user?.memberInfo?.org_id);

      // fetchOrgByQuery('email', '==', user.email).then((org) => {
      //   console.log('logging auth context org', org);

      //   setOrganizationId(org?.id);
      // });
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
