import { addDoc, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from '@firebase/firestore';
import axios from 'axios';
import { inviteeCollection, memberCollection } from 'services/db/firestore';
import { IInvitee, IMember } from 'types/models';

export const fetchMember = async (id: string): Promise<IMember | undefined> => {
  const memberRef = doc(memberCollection, id);
  const member = await getDoc(memberRef);
  return member.data();
};

export const fetchMemberByEmail = async (email: string): Promise<IMember | undefined> => {
  const q = query(memberCollection, where('email', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return querySnapshot?.docs[0]?.data();
  return;
};

export const fetchInviteeByEmail = async (email: string): Promise<IInvitee | undefined> => {
  const q = query(inviteeCollection, where('email', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return querySnapshot?.docs[0]?.data();
  return;
};

// export const createOrUpdateMember = async (member: IMember, id: string): Promise<void> => {
//   const memberRef = doc(memberCollection, id);
//   await setDoc(memberRef, member);
// };

export const newMember = async (uid: string, member: IMember): Promise<void> => {
  const q = query(inviteeCollection, where('email', '==', member.email), limit(1));
  const querySnapshot = await getDocs(q);
  const invitee = querySnapshot?.docs[0];

  if (invitee) await deleteDoc(invitee.ref);

  const m = query(memberCollection, where('email', '==', member.email), limit(1));
  const existingMemberQuerySnapshot = await getDocs(m);
  const existingMember = existingMemberQuerySnapshot?.docs[0];

  const path = existingMember ? existingMember.id : uid;
  const memberRef = doc(memberCollection, path);
  const memberInfo: IMember = {
    ...invitee?.data(),
    email: member.email || '',
    name: member.name,
    companyEmail: invitee?.data().email || member.companyEmail || '',
    type: member.type || 'anonymous',
    source: member.source || '',
    org_id: invitee?.data().org_id || member.org_id || '',
    joined: member.joined || Math.floor(new Date().getTime() / 1000),
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  };
  if (member.wallets) memberInfo.wallets = member.wallets;
  await setDoc(memberRef, memberInfo);

  // send slack message

  if (member.type === 'founder' && (!existingMember || (existingMember && existingMember.data().type !== 'founder'))) {
    await axios.post(`/api/slack/add-member`, {
      email: member.email
    });
  }
};

export const addInvitee = async (invitee: IInvitee): Promise<void> => {
  await addDoc(inviteeCollection, {
    ...invitee,
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const removeMember = async (id: string): Promise<void> => {
  await deleteDoc(doc(memberCollection, id));
};

export const removeInvite = async (id: string): Promise<void> => {
  await deleteDoc(doc(inviteeCollection, id));
};

export const fetchAllMembers = async (): Promise<IMember[]> => {
  const snapshot = await getDocs(memberCollection);
  const documents: IMember[] = [];
  snapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};

export const updateMember = async (id: string, updateObj: { [key: string]: any }): Promise<void> => {
  const recipientRef = doc(memberCollection, id);

  await updateDoc(recipientRef, {
    ...updateObj
  });
};

export const fetchMembersByEmails = async (emails: string[]): Promise<IMember[] | undefined> => {
  const q = query(memberCollection, where('email', 'in', emails));
  const querySnapshot = await getDocs(q);
  const documents: IMember[] = [];
  querySnapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};
