import { getDocs, query, where } from 'firebase/firestore';
import { IWebsite } from 'types/models';

import { websiteCollection } from './firestore';

export const fetchWebsiteByDomain = async (domain: string): Promise<IWebsite | undefined> => {
  const q = query(websiteCollection, where('domain', 'array-contains', domain.toLowerCase()));
  const docs = await getDocs(q);

  const result: IWebsite[] = [];
  if (docs && !docs.empty) {
    docs.forEach((doc) => result.push(doc.data()));
  }

  return result?.[0];
};
