import { addDoc, doc, getDoc, getDocs, limit, query, setDoc, where } from '@firebase/firestore';
import { safeCollection } from 'services/db/firestore';
import { ISafe } from 'types/models';

export const fetchSafe = async (id: string): Promise<ISafe | undefined> => {
  const safeRef = doc(safeCollection, id);
  const safeDoc = await getDoc(safeRef);
  return safeDoc.data();
};

export const fetchSafeByAddress = async (address: string): Promise<ISafe | undefined> => {
  const q = query(safeCollection, where('address', '==', address), limit(1));
  const querySnapshot = await getDocs(q);
  const safe = querySnapshot?.docs.at(0)?.data();
  if (safe) safe.id = querySnapshot?.docs.at(0)?.ref.id;
  return safe;
};

export const updateSafe = async (safe: ISafe, id: string): Promise<void> => {
  const safeRef = doc(safeCollection, id);
  await setDoc(safeRef, safe);
};

export const createOrUpdateSafe = async (safe: ISafe, ref?: string): Promise<string> => {
  if (ref) {
    const safeRef = doc(safeCollection, ref);
    await setDoc(safeRef, safe);
    return ref;
  }
  const safeRef = await addDoc(safeCollection, safe);
  return safeRef.id;
};
