import { Unsubscribe, onSnapshot, query, where } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { inviteeCollection, memberCollection } from 'services/db/firestore';
import { IInvitee, IMember } from 'types/models';
import { arraySort } from 'utils';

interface ITeammateData {
  pendingTeammates: IInvitee[];
  teammates: IMember[];
}
const TeammateContext = createContext({} as ITeammateData);

export function TeammateContextProvider({ children }: any) {
  const [teammates, setTeammates] = useState<IMember[]>([]);
  const [pendingTeammates, setPendingTeammates] = useState<IInvitee[]>([]);
  const { organizationId } = useAuthContext();

  useEffect(() => {
    if (!organizationId) return;

    let members: IMember[] = [];
    let pendingMembers: IInvitee[] = [];
    let memberSub: Unsubscribe, inviteeSub: Unsubscribe;

    const getTeammates = () => {
      const q = query(memberCollection, where('org_id', '==', organizationId), where('source', '==', ''));
      memberSub = onSnapshot(q, (snapshot) => {
        const ids = members.map((member) => member.id);

        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;
          const data = change.doc.data();

          if (change.type === 'added' && !ids.includes(id)) {
            const data = change.doc.data();
            members.push({
              id,
              ...data
            });
          } else if (change.type === 'modified') {
            members = members.map((member) => {
              if (member.id === id) {
                return {
                  id,
                  ...data
                };
              }
              return member;
            });
          } else if (change.type === 'removed') {
            members = members.filter((member) => member.id !== id);
          }
        });
        setTeammates(arraySort(members, 'name').slice());
      });
    };

    const getPendingMembers = () => {
      const q = query(inviteeCollection, where('org_id', '==', organizationId));
      inviteeSub = onSnapshot(q, (snapshot) => {
        const ids = pendingMembers.map((member) => member.id);

        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;
          const data = change.doc.data();
          if (change.type === 'added' && !ids.includes(id)) {
            const data = change.doc.data();
            pendingMembers.push({
              id,
              ...data
            });
          } else if (change.type === 'modified') {
            pendingMembers = pendingMembers.map((member) => {
              if (member.id === id) {
                return {
                  id,
                  ...data
                };
              }
              return member;
            });
          } else if (change.type === 'removed') {
            pendingMembers = pendingMembers.filter((member) => member.id !== id);
          }
        });

        setPendingTeammates(arraySort(pendingMembers, 'name').slice());
      });
    };

    getTeammates();
    getPendingMembers();

    return () => {
      memberSub();
      inviteeSub();
    };
  }, [organizationId]);

  const value = useMemo(
    () => ({
      teammates,
      pendingTeammates
    }),
    [teammates, pendingTeammates]
  );

  return <TeammateContext.Provider value={value}>{children}</TeammateContext.Provider>;
}

export const useTeammateContext = () => ({
  ...useContext(TeammateContext)
});

// Usage: Just use the useTeammate that has { status, setStatus } properties anywhere in the app.
// Values for the statuses are IN_PROGRESS, PENDING, SUCCESS and '' (blank), blank value will close the modal.
