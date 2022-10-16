import { addDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { orgCollection } from 'services/db/firestore';
import { IOrganization } from 'types/models';

export const fetchOrg = async (id: string): Promise<IOrganization | undefined> => {
  const orgRef = doc(orgCollection, id);
  const orgDoc = await getDoc(orgRef);
  return orgDoc.data();
};

export const updateOrg = async (org: IOrganization, id: string): Promise<void> => {
  const orgRef = doc(orgCollection, id);
  await setDoc(orgRef, org);
};

export const createOrg = async (org: IOrganization): Promise<string> => {
  const orgRef = await addDoc(orgCollection, org);
  return orgRef.id;
};
