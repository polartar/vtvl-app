import {
  WhereFilterOp,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from '@firebase/firestore';
import { IRecipient, IRecipientDoc } from 'types/models';

import { recipientCollection } from './firestore';

export const createRecipient = async (recipient: IRecipient): Promise<string> => {
  const recipientRef = await addDoc(recipientCollection, recipient);
  return recipientRef.id;
};

export const editRecipient = async (id: string, recipient: IRecipient): Promise<void> => {
  const recipientRef = doc(recipientCollection, id);

  await setDoc(recipientRef, {
    ...recipient,
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const updateRecipient = async (id: string, updateObj: { [key: string]: any }): Promise<void> => {
  const recipientRef = doc(recipientCollection, id);

  await updateDoc(recipientRef, {
    ...updateObj,
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const fetchRecipient = async (id: string): Promise<IRecipient | undefined> => {
  const recipientRef = doc(recipientCollection, id);
  const recipientDoc = await getDoc(recipientRef);
  return recipientDoc.data();
};

export const fetchRecipientByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<IRecipientDoc | undefined> => {
  const q = query(recipientCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, data: querySnapshot.docs[0].data() };
  }
};

export const fetchAllRecipients = async () => {
  const snapshot = await getDocs(recipientCollection);
  const documents: IRecipient[] = [];
  snapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};

export const fetchAllRecipientsWithId = async () => {
  const snapshot = await getDocs(recipientCollection);
  const documents: { id: string; data: IRecipient }[] = [];
  snapshot.forEach((doc) => {
    documents.push({ id: doc.id, data: doc.data() });
  });
  return documents;
};

export const fetchRecipientsByQuery = async (
  fields: string[],
  syntaxs: WhereFilterOp[],
  values: any[]
): Promise<IRecipientDoc[]> => {
  const q = query(
    recipientCollection,
    ...fields.map((_, index) => where(fields[index], syntaxs[index], values[index]))
  );
  const querySnapshot = await getDocs(q);

  const results: { id: string; data: IRecipient }[] = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => results.push({ id: doc.id, data: doc.data() }));
  }
  return results;
};

export const deleteRecipient = async (id: string): Promise<void> => {
  const recipientRef = doc(recipientCollection, id);
  await deleteDoc(recipientRef);
};
