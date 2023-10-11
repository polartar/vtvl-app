import { CollectionReference, DocumentData, collection, getFirestore } from 'firebase/firestore';
import { IMilestoneForm } from 'types/milestone';
import type {
  IInvitee,
  IMember,
  IOrganization,
  IRecipient,
  ISafe,
  IToken,
  IUser,
  IVesting,
  IVestingTemplate,
  IWebsite
} from 'types/models';
import { IMilestoneTemplate } from 'types/models/milestoneTemplate';

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
export const inviteeCollection = getCollection<IInvitee>('invitee');
export const recipientCollection = getCollection<IRecipient>('recipients');
export const websiteCollection = getCollection<IWebsite>('websites');
export const milestoneTemplateCollection = getCollection<IMilestoneTemplate>('milestoneTemplates');
export const milestoneVesting = getCollection<IMilestoneForm>('milestoneVestings');
