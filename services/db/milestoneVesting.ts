import { WhereFilterOp, addDoc, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { milestoneVesting } from 'services/db/firestore';
import { IMilestoneForm } from 'types/milestone';
import { generateRandomName } from 'utils/shared';

export const fetchMilestoneVesting = async (id: string): Promise<IMilestoneForm | undefined> => {
  const vestingRef = doc(milestoneVesting, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const fetchAllMilestoneVestings = async () => {
  const snapshot = await getDocs(milestoneVesting);
  const documents: IMilestoneForm[] = [];
  snapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};

export const fetchMilestoneVestingsByQuery = async (
  fields: string[],
  syntaxs: WhereFilterOp[],
  values: any[]
): Promise<{ id: string; data: IMilestoneForm }[] | []> => {
  const q = query(milestoneVesting, ...fields.map((f, index) => where(fields[index], syntaxs[index], values[index])));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateMilestoneVesting = async (vesting: IMilestoneForm, id: string): Promise<void> => {
  const vestingRef = doc(milestoneVesting, id);
  await setDoc(vestingRef, vesting);
};

export const createMilestoneVesting = async (vesting: IMilestoneForm): Promise<string> => {
  const vestingRef = await addDoc(milestoneVesting, vesting);
  return vestingRef.id;
};

export const deleteMilestoneVesting = async (id: string): Promise<void> => {
  const vestingRef = doc(milestoneVesting, id);
  await deleteDoc(vestingRef);
};

export const fetchMilestoneVestingSchedules = async (orgId: string): Promise<IMilestoneForm[] | undefined> => {
  // Query the vesting collection with the right organization id
  const q = query(milestoneVesting, where('organizationId', '==', orgId));
  const querySnapshot = await getDocs(q);
  // Create a new array for the data and loop through the fetched data from firestore
  const records: IMilestoneForm[] = [];
  querySnapshot.docs.forEach((item) => {
    records.push(item.data());
  });
  return records;
};
