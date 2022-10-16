import { addDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { safeCollection } from 'services/db/firestore';
import { ISafe } from 'types/models';

export const fetchSafe = async (id: string): Promise<ISafe | undefined> => {
  const safeRef = doc(safeCollection, id);
  const safeDoc = await getDoc(safeRef);
  return safeDoc.data();
};

export const updateSafe = async (safe: ISafe, id: string): Promise<void> => {
  const safeRef = doc(safeCollection, id);
  await setDoc(safeRef, safe);
};

export const createSafe = async (safe: ISafe): Promise<string> => {
  const safeRef = await addDoc(safeCollection, safe);
  return safeRef.id;
};
