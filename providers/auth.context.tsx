import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
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
import { createOrUpdateMember, fetchMemberByEmail, newMember } from 'services/db/member';
import { createOrg, fetchOrgByQuery } from 'services/db/organization';
import { IMember, IOrganization, IUser } from 'types/models';

export type NewLogin = {
  isFirstLogin: boolean;
  uuid: string;
};

export type AuthContextData = {
  user: IUser | undefined;
  organizationId: string | undefined;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  onboardNewMember: (member: { name: string; email: string; type: string }, org: IOrganization) => Promise<void>;
  teammateSignIn: (email: string, url: string) => Promise<void>;
  sendTeammateInvite: (email: string, type: string) => Promise<void>;
  sendLoginLink: (email: string) => Promise<void>;
  loading: boolean;
  logOut: () => Promise<void>;
  error: string;
  showSideBar: boolean;
  sidebarIsExpanded: boolean;
  toggleSideBar: () => void;
  expandSidebar: () => void;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const [user, setUser] = useState<IUser | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const tried = useEagerConnect();
  const [error, setError] = useState('');
  // Remove after implementing context to show/hide the sidebar
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [sidebarIsExpanded, setSidebarIsExpanded] = useState<boolean>(false);
  console.log({ organizationId });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const additionalInfo = getAdditionalUserInfo(credential);
    const memberInfo = await fetchMemberByEmail(credential.user.email || '');
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMemberByEmail(credential.user.email || '');
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMemberByEmail(credential.user.email || '');
    setOrganizationId(memberInfo?.org_id);
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
  };

  const onboardNewMember = async (member: { name: string; email: string; type: string }, org: IOrganization) => {
    setLoading(true);
    if (!user) throw new Error('please sign in to setup your account');

    const orgId = await createOrg({ name: org.name, email: org.email, user_id: user?.uid });
    const memberInfo: IMember = {
      ...member,
      org_id: orgId,
      joined: Math.floor(new Date().getTime() / 1000)
    };
    await createOrUpdateMember(memberInfo, user?.uid || '');
    setOrganizationId(orgId);
    setUser({ ...user, memberInfo });
    setLoading(false);
  };

  const teammateSignIn = async (email: string, url?: string): Promise<void> => {
    setLoading(true);

    const member = await fetchMemberByEmail(email);

    // first time user
    const isValidLink = isSignInWithEmailLink(auth, url || '');
    if (!isValidLink || !email) throw new Error('invalid sign url');

    const params: any = new URL(url || '');
    const type = params.searchParams.get('type') || 'employee';
    console.log('user type is ', type);
    const credential = await signInWithEmailLink(auth, email, url);
    const additionalInfo = getAdditionalUserInfo(credential);
    await newMember(email, type, credential.user.uid);

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    setUser({ ...credential.user, memberInfo: member });
    setLoading(false);
    Router.push('/onboarding/member');
  };

  const sendLoginLink = async (email: string): Promise<void> => {
    setLoading(true);
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/dashboard`,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    setLoading(false);
  };

  const sendTeammateInvite = async (email: string, type: string): Promise<void> => {
    setLoading(true);
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/member-login?type=${type}`,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    setLoading(false);
  };

  const anonymousSignIn = async (): Promise<NewLogin | undefined> => {
    setLoading(true);
    const credential = await signInAnonymously(auth);
    const additionalInfo = getAdditionalUserInfo(credential);
    setUser(credential.user);
    setLoading(false);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const logOut = () => signOut(auth);

  // Remove after implementing context to show/hide the sidebar
  const toggleSideBar = () => setShowSideBar((prev) => !prev);
  const expandSidebar = () => setSidebarIsExpanded((prev) => !prev);

  const memoedValue = useMemo(
    () => ({
      user,
      organizationId,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      anonymousSignIn,
      teammateSignIn,
      sendTeammateInvite,
      sendLoginLink,
      onboardNewMember,
      loading,
      isNewUser,
      logOut,
      error,
      // Remove after implementing context to show/hide the sidebar
      showSideBar,
      sidebarIsExpanded,
      toggleSideBar,
      expandSidebar
    }),
    [user, loading, error, isNewUser, showSideBar, sidebarIsExpanded, organizationId]
  );

  useEffect(() => {
    if (user && user.email) {
      fetchOrgByQuery('email', '==', user.email).then((org) => setOrganizationId(org?.id));
    }
  }, [user, organizationId]);

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuthContext = () => ({
  ...useContext(AuthContext)
});
