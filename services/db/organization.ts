import { doc, addDoc, setDoc, getDoc } from '@firebase/firestore';
import { orgCollection } from 'services/db/firestore';
import { Organization } from 'types/models';

export const fetchOrg = async (id: string) : Promise<Organization | undefined> => {
    const orgRef = doc(orgCollection, id)
    const orgDoc = await getDoc(orgRef)
    return orgDoc.data();
}

export const updateOrg = async (org: Organization, id: string) : Promise<void> => {
    const orgRef = doc(orgCollection, id)
    await setDoc(orgRef, org)
}

export const createOrg = async (org: Organization) : Promise<string> => {
    const orgRef = await addDoc(orgCollection, org)
    return orgRef.id;
}
