import { CollectionReference, DocumentData, collection, getFirestore } from 'firebase/firestore';
import type { IMember, IOrganization, ISafe, IUser } from 'types/models';

import firebase from '../auth/firebase';

export const db = getFirestore(firebase);

const getCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const userCollection = getCollection<IUser>('users');
export const memberCollection = getCollection<IMember>('members');
export const orgCollection = getCollection<IOrganization>('organizations');
export const safeCollection = getCollection<ISafe>('safes');
