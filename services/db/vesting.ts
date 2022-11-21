import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { vestingCollection } from 'services/db/firestore';
import { IVesting } from 'types/models';

export const fetchVesting = async (id: string): Promise<IVesting | undefined> => {
  const vestingRef = doc(vestingCollection, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const fetchAllVestings = async (): Promise<IVesting[] | []> => {
  const querySnapshot = await getDocs(vestingCollection);
  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push(transformVastingDoc({ ...doc.data(), id: doc.id })));
  }
  return result;
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

/**
 * To return records based on organizationId
 * @param orgId
 * @returns
 */
export const fetchVestingSchedules = async (orgId: string): Promise<IVesting[] | undefined> => {
  // Query the vesting collection with the right organization id
  const q = query(vestingCollection, where('organizationId', '==', orgId));
  const querySnapshot = await getDocs(q);
  // Create a new array for the data and loop through the fetched data from firestore
  const records: IVesting[] = [];
  querySnapshot.docs.forEach((item) => {
    records.push(item.data());
  });
  return records;
};

const transformVastingDoc = (doc: any) => ({
  id: doc?.id || '',
  recipientType: doc?.recipients[0]?.recipientType[0]?.value || '',
  company: doc?.recipients[0]?.company || '',
  token: doc?.details.token || 'BICO',
  address: doc?.recipients[0]?.walletAddress || '',
  name: doc?.recipients[0]?.name || '',
  totalAllocation: doc?.details?.amountToBeVested || 0,
  claimed: doc?.claimed || 0,
  unclaimed: doc?.unclaimed || 0,
  withdrawn: doc?.withdrawn || 0,
  alert: doc?.alert || false
});
