import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { contractCollection } from 'services/db/firestore';
import { db } from 'services/db/firestore';
import { IContract } from 'types/models';

export const fetchContract = async (id: string): Promise<IContract | undefined> => {
  const contractRef = doc(contractCollection, id);
  const contractDoc = await getDoc(contractRef);
  return contractDoc.data();
};

export const fetchContractByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IContract | undefined } | undefined> => {
  const q = query(contractCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, data: querySnapshot.docs[0].data() };
  }
};

export const updateContract = async (contract: IContract, id: string): Promise<void> => {
  const contractRef = doc(contractCollection, id);
  await setDoc(contractRef, contract);
};

export const createContract = async (contract: IContract): Promise<string> => {
  const contractRef = await addDoc(contractCollection, contract);
  return contractRef.id;
};
