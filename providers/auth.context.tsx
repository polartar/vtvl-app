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
import { useRouter } from 'next/router';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth } from 'services/auth/firebase';
import { fetchMemberByEmail } from 'services/db/member';
import { IUser } from 'types/models';

export type NewLogin = {
  isFirstLogin: boolean;
  uuid: string;
};

export type AuthContextData = {
  user: IUser | undefined;
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
  const [user, setUser] = useState<IUser | undefined>();
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
    setLoading(true);
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const additionalInfo = getAdditionalUserInfo(credential);

    setUser(credential.user);
    setLoading(false);
    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMemberByEmail(credential.user.email || '');
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const memberInfo = await fetchMemberByEmail(credential.user.email || '');
    setUser({ ...credential.user, memberInfo });
    setLoading(false);
  };

  const teammateSignIn = async (email: string, url: string): Promise<NewLogin | undefined> => {
    setLoading(true);
    const isValidLink = isSignInWithEmailLink(auth, url);
    if (!isValidLink || !email) throw new Error('invalid sign url');

    const member = await fetchMemberByEmail(email);
    if (!member) throw new Error('invalid member sign up');
    console.log('we have member here ', member);

    const credential = await signInWithEmailLink(auth, member.email, url);
    const additionalInfo = getAdditionalUserInfo(credential);

    setUser({ ...credential.user, memberInfo: member });
    setLoading(false);

    if (additionalInfo?.isNewUser) setIsNewUser(additionalInfo.isNewUser);
    setLoading(false);
    return { isFirstLogin: additionalInfo?.isNewUser || false, uuid: credential.user.uid };
  };

  const sendTeammateInvite = async (email: string, teammateId: string): Promise<void> => {
    setLoading(true);
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/member-login?id=${teammateId}`,
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
    [user, loading, error, isNewUser]
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;
