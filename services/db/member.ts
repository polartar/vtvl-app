import { addDoc, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, where } from '@firebase/firestore';
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
  return querySnapshot?.docs.at(0)?.data();
};

// export const createOrUpdateMember = async (member: IMember, id: string): Promise<void> => {
//   const memberRef = doc(memberCollection, id);
//   await setDoc(memberRef, member);
// };

export const newMember = async (uid: string, member: IMember): Promise<void> => {
  const q = query(inviteeCollection, where('email', '==', member.email), limit(1));
  const querySnapshot = await getDocs(q);
  const invitee = querySnapshot?.docs.at(0);

  if (invitee) await deleteDoc(invitee.ref);

  const m = query(memberCollection, where('email', '==', member.email), limit(1));
  const existingMemberQuerySnapshot = await getDocs(m);
  const existingMember = existingMemberQuerySnapshot?.docs.at(0);

  const path = existingMember ? existingMember.id : uid;
  const memberRef = doc(memberCollection, path);
  await setDoc(memberRef, {
    ...invitee?.data(),
    email: member.email || '',
    companyEmail: invitee?.data().email || member.companyEmail || '',
    type: invitee?.data().email ? 'manager' : member.type || 'anonymous',
    org_id: invitee?.data().org_id || member.org_id || '',
    joined: member.joined || Math.floor(new Date().getTime() / 1000),
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const addInvitee = async (invitee: IInvitee): Promise<void> => {
  await addDoc(inviteeCollection, {
    ...invitee,
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};
