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
import { useRouter } from 'next/router';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMemberByEmail } from 'services/db/member';

export type NewLogin = {
  isFirstLogin: boolean;
  uuid: string;
};

export type AuthContextData = {
  user: User | undefined;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<NewLogin | undefined>;
  anonymousSignIn: () => Promise<NewLogin | undefined>;
  teammateSignIn: (email: string, url: string) => Promise<NewLogin | undefined>;
  sendTeammateInvite: (email: string, teammateId: string) => Promise<void>;
  loading: boolean;
  logOut: () => Promise<void>;
  error: string;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: any) {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

  const memoedValue = useMemo(
    () => ({
      user,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      anonymousSignIn,
      teammateSignIn,
      sendTeammateInvite,
      loading,
      isNewUser,
      logOut,
      error
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;
