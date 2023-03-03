import { onSnapshot, query, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { recipientCollection } from 'services/db/firestore';
import { IRecipientDoc } from 'types/models';

import { useAuthContext } from './auth.context';

interface IRecipientContextData {
  isRecipientLoading: boolean;
  recipients: IRecipientDoc[];
}

const RecipientContext = createContext({} as IRecipientContextData);

export function RecipientContextProvider({ children }: any) {
  // const { library, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [isRecipientLoading, setIsRecipientLoading] = useState(true);

  const [recipients, setRecipients] = useState<IRecipientDoc[]>([]);

  const value = useMemo(
    () => ({
      isRecipientLoading,
      recipients
    }),
    [isRecipientLoading, recipients]
  );

  useEffect(() => {
    let allRecipients: IRecipientDoc[] = [];

    if (!organizationId) return;
    setIsRecipientLoading(true);
    const q = query(recipientCollection, where('organizationId', '==', organizationId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          allRecipients.push({
            data,
            id: change.doc.id
          });
        } else if (change.type === 'modified') {
          const data = change.doc.data();
          allRecipients = allRecipients.map((recipient) => {
            if (recipient.id === change.doc.id) {
              return {
                data,
                id: recipient.id
              };
            }
            return recipient;
          });

          setRecipients(allRecipients.slice());
        } else if (change.type === 'removed') {
          allRecipients = allRecipients.filter((recipient) => recipient.id !== change.doc.id);

          setRecipients(allRecipients.slice());
        }
      });

      setRecipients(allRecipients.slice());
      setIsRecipientLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [organizationId]);

  return <RecipientContext.Provider value={value}>{children}</RecipientContext.Provider>;
}

export const useRecipientContext = () => ({
  ...useContext(RecipientContext)
});
