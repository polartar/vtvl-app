import { CollectionReference, DocumentData, collection, getFirestore } from 'firebase/firestore';
import type {
  IInvitee,
  IMember,
  IOrganization,
  ISafe,
  IToken,
  ITransaction,
  IUser,
  IVesting,
  IVestingContract,
  IVestingTemplate
} from 'types/models';

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
export const vestingTemplateCollection = getCollection<IVestingTemplate>('vestingTemplates');
export const vestingContractCollection = getCollection<IVestingContract>('vestingContracts');
export const tokenCollection = getCollection<IToken>('tokens');
export const transactionCollection = getCollection<ITransaction>('transactions');
export const inviteeCollection = getCollection<IInvitee>('invitee');
