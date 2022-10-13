import { CollectionReference, DocumentData, collection, getFirestore } from 'firebase/firestore';
import firebase from 'services/auth/firebase';
import type { Member, Organization, Safe, User } from 'types/models';

export const db = getFirestore(firebase);

const getCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const userCollection = getCollection<User>('users');
export const memberCollection = getCollection<Member>('members');
export const orgCollection = getCollection<Organization>('organizations');
export const safeCollection = getCollection<Safe>('safes');
