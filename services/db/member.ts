import { doc, setDoc, getDoc } from '@firebase/firestore';
import { memberCollection } from 'services/db/firestore';
import { Member } from 'types/models';

export const fetchMember = async (id: string) : Promise<Member | undefined> => {
    const memberRef = doc(memberCollection, id)
    const member = await getDoc(memberRef)
    return member.data();
}

export const updateMember = async (org: Member, id: string) : Promise<void> => {
    const memberRef = doc(memberCollection, id)
    await setDoc(memberRef, org)
}

export const createMember = async (member: Member) : Promise<void> => {
    const memberRef = doc(memberCollection)
    await setDoc(memberRef, member)
}
