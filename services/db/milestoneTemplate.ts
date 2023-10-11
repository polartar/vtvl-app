import { WhereFilterOp, addDoc, doc, getDoc, getDocs, query, setDoc, where } from '@firebase/firestore';
import { milestoneTemplateCollection } from 'services/db/firestore';
import { IMilestoneTemplate } from 'types/models/milestoneTemplate';

export const fetchMilestoneTemplate = async (id: string): Promise<IMilestoneTemplate | undefined> => {
  const milestoneRef = doc(milestoneTemplateCollection, id);
  const milestoneDoc = await getDoc(milestoneRef);
  return milestoneDoc.data();
};

export const fetchMilestoneTemplatesByQuery = async (
  field: string,
  syntax: WhereFilterOp,
  value: string
): Promise<{ id: string; data: IMilestoneTemplate }[] | []> => {
  const q = query(milestoneTemplateCollection, where(field, syntax, value));
  const querySnapshot = await getDocs(q);

  const result: any = [];

  if (querySnapshot && !querySnapshot.empty) {
    querySnapshot.forEach((doc) => result.push({ id: doc.id, data: doc.data() }));
  }
  return result;
};

export const updateMilestoneTemplate = async (milestone: IMilestoneTemplate, id: string): Promise<void> => {
  const milestoneRef = doc(milestoneTemplateCollection, id);
  await setDoc(milestoneRef, milestone);
};

export const createMilestoneTemplate = async (milestone: IMilestoneTemplate): Promise<string> => {
  const milestoneRef = await addDoc(milestoneTemplateCollection, {
    ...milestone,
    createdAt: Math.floor(new Date().getTime() / 1000)
  });
  return milestoneRef.id;
};
