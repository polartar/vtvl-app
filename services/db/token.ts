import {
  QueryDocumentSnapshot,
  WhereFilterOp,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from '@firebase/firestore';
import { tokenCollection } from 'services/db/firestore';
import { IToken } from 'types/models';

export const fetchToken = async (id: string): Promise<IToken | undefined> => {
  const tokenRef = doc(tokenCollection, id);
  const tokenDoc = await getDoc(tokenRef);
  return tokenDoc.data();
};

export const fetchTokensByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<QueryDocumentSnapshot<IToken>[] | undefined> => {
  const q = query(tokenCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return querySnapshot.docs;
  }
};

export const fetchTokenByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IToken | undefined } | undefined> => {
  const q = query(tokenCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, data: querySnapshot.docs[0].data() };
  }
};

export const updateToken = async (token: IToken, id: string): Promise<void> => {
  const tokenRef = doc(tokenCollection, id);
  await setDoc(tokenRef, token);
};

export const createToken = async (token: IToken): Promise<string> => {
  const tokenRef = await addDoc(tokenCollection, token);
  return tokenRef.id;
};
