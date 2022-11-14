import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { vestingTemplateCollection } from 'services/db/firestore';
import { IVestingTemplate } from 'types/models';

export const fetchVestingTemplate = async (id: string): Promise<IVestingTemplate | undefined> => {
  const vestingRef = doc(vestingTemplateCollection, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const fetchVestingTemplatesByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IVestingTemplate }[] | []> => {
  const q = query(vestingTemplateCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateVestingTemplate = async (vesting: IVestingTemplate, id: string): Promise<void> => {
  const vestingRef = doc(vestingTemplateCollection, id);
  await setDoc(vestingRef, vesting);
};

export const createVestingTemplate = async (vesting: IVestingTemplate): Promise<string> => {
  const vestingRef = await addDoc(vestingTemplateCollection, vesting);
  return vestingRef.id;
};
