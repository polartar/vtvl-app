import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { orgCollection } from 'services/db/firestore';
import { IOrganization } from 'types/models';

export const fetchOrg = async (id: string): Promise<IOrganization | undefined> => {
  const orgRef = doc(orgCollection, id);
  const orgDoc = await getDoc(orgRef);
  return orgDoc.data();
};

export const fetchOrgByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IOrganization | undefined } | undefined> => {
  const q = query(orgCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  if (querySnapshot && !querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, data: querySnapshot.docs[0].data() };
  }
};

export const updateOrg = async (org: IOrganization, id: string): Promise<void> => {
  const orgRef = doc(orgCollection, id);
  await setDoc(orgRef, {
    ...org,
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
};

export const createOrg = async (org: IOrganization): Promise<string> => {
  const orgRef = await addDoc(orgCollection, {
    ...org,
    createdAt: Math.floor(new Date().getTime() / 1000),
    updatedAt: Math.floor(new Date().getTime() / 1000)
  });
  return orgRef.id;
};

export const fetchAllOrganizations = async () => {
  const snapshot = await getDocs(orgCollection);
  const documents: any[] = [];
  snapshot.forEach((doc) => {
    documents.push({ ...doc.data(), id: doc.id });
  });
  return documents;
};
