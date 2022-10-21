import { CollectionReference, DocumentData, collection, getFirestore } from 'firebase/firestore';
import type { IContract, IMember, IOrganization, ISafe, IUser, IVesting } from 'types/models';

import firebase from '../auth/firebase';

export const db = getFirestore(firebase);

const getCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const userCollection = getCollection<IUser>('users');
export const memberCollection = getCollection<IMember>('members');
export const orgCollection = getCollection<IOrganization>('organizations');
export const safeCollection = getCollection<ISafe>('safes');
export const vestingCollection = getCollection<IVesting>('vestings');
export const contractCollection = getCollection<IContract>('contracts');
