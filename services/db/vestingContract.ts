import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { vestingContractCollection } from 'services/db/firestore';
import { db } from 'services/db/firestore';
import { IVestingContract } from 'types/models';

export const fetchVestingContract = async (id: string): Promise<IVestingContract | undefined> => {
  const vestingContractRef = doc(vestingContractCollection, id);
  const vestingContractDoc = await getDoc(vestingContractRef);
  return vestingContractDoc.data();
};

export const fetchVestingContractByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IVestingContract | undefined } | undefined> => {
  const q = query(vestingContractCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, data: querySnapshot.docs[0].data() };
  }
};

export const fetchVestingContractsByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IVestingContract }[] | []> => {
  const q = query(vestingContractCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateVestingContract = async (contract: IVestingContract, id: string): Promise<void> => {
  const vestingContractRef = doc(vestingContractCollection, id);
  await setDoc(vestingContractRef, contract);
};

export const createVestingContract = async (contract: IVestingContract): Promise<string> => {
  const vestingContractRef = await addDoc(vestingContractCollection, contract);
  return vestingContractRef.id;
};
