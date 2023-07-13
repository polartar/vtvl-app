// Cannot use api-hooks here, so we need to directly request from the api-services
import SafeApiService from '@api-services/SafeApiService';
import { WhereFilterOp, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where } from '@firebase/firestore';
import { USE_NEW_API } from '@utils/constants';
import { ISafeOwner } from 'interfaces/safe';
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
  const safe = querySnapshot?.docs[0]?.data();
  if (safe) safe.id = querySnapshot?.docs[0]?.ref.id;
  return safe;
};

export const updateSafe = async (safe: ISafe, id: string): Promise<void> => {
  const safeRef = doc(safeCollection, id);
  await setDoc(safeRef, {
    ...safe,
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const createOrUpdateSafe = async (safe: ISafe, ref?: string): Promise<string> => {
  // New api integration before migrating states
  if (USE_NEW_API) {
    // Transform data being passed into a new api conformant format
    const { org_id: organizationId, address, chainId, threshold: requiredConfirmations, owners, safe_name } = safe;
    if (ref) {
      await SafeApiService.updateSafeWallet({
        safeId: ref,
        organizationId,
        address,
        chainId,
        name: safe_name || '',
        requiredConfirmations,
        owners: owners as ISafeOwner[]
      });
      // Return the id of the record
      return ref;
    }
    // Add the safe wallet to DB
    const adding = await SafeApiService.addSafeWallet({
      organizationId,
      address,
      chainId,
      name: safe_name || '',
      requiredConfirmations,
      owners: owners as ISafeOwner[]
    });
    // Return the id of the record
    return adding.id || '';
  }

  // Old firebase implementation
  if (ref) {
    const safeRef = doc(safeCollection, ref);
    await setDoc(safeRef, safe);
    return ref;
  }
  const safeRef = await addDoc(safeCollection, {
    ...safe,
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
  return safeRef.id;
};

export const fetchSafeByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<ISafe | undefined> => {
  const q = query(safeCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
};

export const fetchSafesByQuery = async (
  fields: string[],
  syntaxs: WhereFilterOp[],
  values: any[]
): Promise<{ id: string; data: ISafe }[] | []> => {
  const q = query(safeCollection, ...fields.map((f, index) => where(fields[index], syntaxs[index], values[index])));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};
