import { addDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { WhereFilterOp, getDocs, query, where } from 'firebase/firestore';
import { transactionCollection } from 'services/db/firestore';
import { ITransaction } from 'types/models';

export const fetchTransaction = async (id: string): Promise<ITransaction | undefined> => {
  const transactionRef = doc(transactionCollection, id);
  const transactionDoc = await getDoc(transactionRef);
  return transactionDoc.data();
};

export const updateTransaction = async (transaction: ITransaction, id: string): Promise<void> => {
  const transactionRef = doc(transactionCollection, id);
  await setDoc(transactionRef, transaction);
};

export const createTransaction = async (transaction: ITransaction): Promise<string> => {
  const transactionRef = await addDoc(transactionCollection, transaction);
  return transactionRef.id;
};

export const fetchTransactionByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<ITransaction | undefined> => {
  const q = query(transactionCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
};

export const fetchTransactionsByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: ITransaction }[] | []> => {
  const q = query(transactionCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};
