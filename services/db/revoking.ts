import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { revokingCollection } from 'services/db/firestore';
import { IRevoking } from 'types/models';
import { IRevokingDoc } from 'types/models/revoking';
import { generateRandomName } from 'utils/shared';

export const fetchRevoking = async (id: string): Promise<IRevoking | undefined> => {
  const revokingRef = doc(revokingCollection, id);
  const revokingDoc = await getDoc(revokingRef);
  return revokingDoc.data();
};

export const fetchAllRevokings = async () => {
  const snapshot = await getDocs(revokingCollection);
  const documents: IRevoking[] = [];
  snapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};

export const fetchAllRevokingsWithId = async () => {
  const snapshot = await getDocs(revokingCollection);
  const documentsWithId: IRevokingDoc[] = [];
  snapshot.forEach((doc) => {
    documentsWithId.push({ id: doc.id, data: doc.data() });
  });
  return documentsWithId;
};

export const fetchRevokingsByQuery = async (
  fields: string[],
  syntaxs: WhereFilterOp[],
  values: any[]
): Promise<IRevokingDoc[] | []> => {
  const q = query(revokingCollection, ...fields.map((f, index) => where(fields[index], syntaxs[index], values[index])));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateRevoking = async (revoking: IRevoking, id: string): Promise<void> => {
  const revokingRef = doc(revokingCollection, id);
  await setDoc(revokingRef, revoking);
};

export const createRevoking = async (revoking: IRevoking): Promise<string> => {
  const revokingRef = await addDoc(revokingCollection, revoking);
  return revokingRef.id;
};

/**
 * To return records based on organizationId
 * @param orgId
 * @returns
 */
export const fetchRevokingSchedules = async (orgId: string): Promise<IRevoking[] | undefined> => {
  // Query the revoking collection with the right organization id
  const q = query(revokingCollection, where('organizationId', '==', orgId));
  const querySnapshot = await getDocs(q);
  // Create a new array for the data and loop through the fetched data from firestore
  const records: IRevoking[] = [];
  querySnapshot.docs.forEach((item) => {
    records.push(item.data());
  });
  return records;
};
