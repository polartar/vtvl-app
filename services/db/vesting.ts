import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { vestingCollection } from 'services/db/firestore';
import { IVesting } from 'types/models';

export const fetchVesting = async (id: string): Promise<IVesting | undefined> => {
  const vestingRef = doc(vestingCollection, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const fetchVestingsByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IVesting }[] | []> => {
  const q = query(vestingCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateVesting = async (vesting: IVesting, id: string): Promise<void> => {
  const vestingRef = doc(vestingCollection, id);
  await setDoc(vestingRef, vesting);
};

export const createVesting = async (vesting: IVesting): Promise<string> => {
  const vestingRef = await addDoc(vestingCollection, vesting);
  return vestingRef.id;
};
