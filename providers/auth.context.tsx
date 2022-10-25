import {
  GoogleAuthProvider,
  User,
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
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMemberByEmail } from 'services/db/member';
import { fetchOrgByQuery } from 'services/db/organization';

export type NewLogin = {
  isFirstLogin: boolean;
  uuid: string;
};

export type AuthContextData = {
  user: User | undefined;
  organizationId: string | undefined;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  teammateSignIn: (email: string, url: string) => Promise<NewLogin | undefined>;
  sendTeammateInvite: (email: string, teammateId: string) => Promise<void>;
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
  const [user, setUser] = useState<User | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
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
    try {
      setLoading(true);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const additionalInfo = getAdditionalUserInfo(credential);

      setUser(credential.user);
      setLoading(false);
      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
      return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setUser(credential.user);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(credential.user);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const teammateSignIn = async (email: string, url: string): Promise<NewLogin | undefined> => {
    try {
      setLoading(true);
      const isValidLink = isSignInWithEmailLink(auth, url);
      if (!isValidLink || !email) throw new Error('invalid sign in');

      const member = await fetchMemberByEmail(email);
      if (!member) throw new Error('invalid member sign up');

      console.log('we have member here ', member);
      const credential = await signInWithEmailLink(auth, member.email, url);
      const additionalInfo = getAdditionalUserInfo(credential);

      setUser(credential.user);
      setLoading(false);
      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
      return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const sendTeammateInvite = async (email: string, teammateId: string): Promise<void> => {
    try {
      setLoading(true);
      const actionCodeSettings = {
        url: `https://www.example.com/member-login?id=${teammateId}`,
        handleCodeInApp: true,
        dynamicLinkDomain: 'example.page.link'
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  const anonymousSignIn = async (): Promise<NewLogin | undefined> => {
    try {
      setLoading(true);
      const credential = await signInAnonymously(auth);
      const additionalInfo = getAdditionalUserInfo(credential);
      setUser(credential.user);
      setLoading(false);
      if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
      return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
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
    [user, loading, error, showSideBar, sidebarIsExpanded, organizationId]
  );

  useEffect(() => {
    if (user && user.email) {
      fetchOrgByQuery('email', '==', user.email).then((org) => setOrganizationId(org?.id));
    }
  }, [user]);

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;

export const useAuthContext = () => ({
  ...useContext(AuthContext)
});
