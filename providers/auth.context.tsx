import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import { auth } from '../services/auth/firebase';

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
