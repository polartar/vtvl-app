import { addDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { vestingCollection } from 'services/db/firestore';
import { IVesting } from 'types/models';

export const fetchVesting = async (id: string): Promise<IVesting | undefined> => {
  const vestingRef = doc(vestingCollection, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const updateVesting = async (vesting: IVesting, id: string): Promise<void> => {
  const vestingRef = doc(vestingCollection, id);
  await setDoc(vestingRef, vesting);
};

export const createVesting = async (vesting: IVesting): Promise<string> => {
  const vestingRef = await addDoc(vestingCollection, vesting);
  return vestingRef.id;
};
