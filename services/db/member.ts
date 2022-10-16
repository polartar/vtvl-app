import { addDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { memberCollection } from 'services/db/firestore';
import { IMember } from 'types/models';

export const fetchMember = async (id: string): Promise<IMember | undefined> => {
  const memberRef = doc(memberCollection, id);
  const member = await getDoc(memberRef);
  return member.data();
};

export const updateMember = async (member: IMember, id: string): Promise<void> => {
  const memberRef = doc(memberCollection, id);
  await setDoc(memberRef, member);
};

export const createMember = async (member: IMember): Promise<string> => {
  const memberRef = await addDoc(memberCollection, member);
  return memberRef.id;
};
