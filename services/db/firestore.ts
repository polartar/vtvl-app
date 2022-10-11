import { getFirestore, CollectionReference, collection, DocumentData } from 'firebase/firestore';
import type { User, Organization, Safe, Member } from 'types/models';

const firestore = getFirestore()
const getCollection = <T = DocumentData>(collectionName: string) => {
    return collection(firestore, collectionName) as CollectionReference<T>
}

export const userCollection = getCollection<User>('users')
export const memberCollection = getCollection<Member>('members')
export const orgCollection = getCollection<Organization>('organizations')
export const safeCollection = getCollection<Safe>('safes')
