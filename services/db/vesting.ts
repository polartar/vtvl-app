import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import { WhereFilterOp, addDoc, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { USE_NEW_API } from '@utils/constants';
import { IVestingSchedule } from 'interfaces/vestingSchedule';
import { vestingCollection } from 'services/db/firestore';
import { IVesting } from 'types/models';
import { generateRandomName } from 'utils/shared';

export const fetchVesting = async (id: string): Promise<IVesting | undefined> => {
  const vestingRef = doc(vestingCollection, id);
  const vestingDoc = await getDoc(vestingRef);
  return vestingDoc.data();
};

export const fetchAllVestings = async () => {
  const snapshot = await getDocs(vestingCollection);
  const documents: IVesting[] = [];
  snapshot.forEach((doc) => {
    documents.push(doc.data());
  });
  return documents;
};

export const fetchAllVestingsWithId = async () => {
  const snapshot = await getDocs(vestingCollection);
  const documentsWithId: { id: string; data: IVesting }[] = [];
  snapshot.forEach((doc) => {
    documentsWithId.push({ id: doc.id, data: doc.data() });
  });
  return documentsWithId;
};

export const fetchVestingsByQuery = async (
  fields: string[],
  syntaxs: WhereFilterOp[],
  values: any[]
): Promise<{ id: string; data: IVesting }[] | []> => {
  const q = query(vestingCollection, ...fields.map((f, index) => where(fields[index], syntaxs[index], values[index])));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateVesting = async (vesting: IVesting, id: string): Promise<void | IVestingSchedule> => {
  // Use new api pattern
  if (USE_NEW_API) {
    try {
      const res = VestingScheduleApiService.updateVestingSchedule(vesting, id);
      return res;
    } catch (err) {
      // Error
      console.log('Error new vesting schedule update', err);
    }
    return;
  } else {
    const vestingRef = doc(vestingCollection, id);
    await setDoc(vestingRef, vesting);
  }
};

export const createVesting = async (vesting: IVesting): Promise<string> => {
  const vestingRef = await addDoc(vestingCollection, { ...vesting, name: vesting.name || generateRandomName() });
  return vestingRef.id;
};

export const deleteVesting = async (id: string): Promise<void> => {
  const vestingRef = doc(vestingCollection, id);
  await deleteDoc(vestingRef);
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
