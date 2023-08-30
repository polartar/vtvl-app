import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import { fetchMembersByEmails, newMember } from 'services/db/member';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { IUserType } from 'types/models/member';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { emails } = req.body;

  const recipients = await fetchRecipientsByQuery(['email'], ['in'], [emails]);

  const members = await fetchMembersByEmails(emails);
  const memberEmails = members?.map((member) => member.email);

  await Promise.all(
    recipients.map(async (recipient) => {
      if (!memberEmails?.includes(recipient.data.email)) {
        try {
          const user = await firebaseAdmin?.auth().createUser({
            email: recipient.data.email,
            displayName: recipient.data.name
          });
          return await newMember(String(user?.uid), {
            email: recipient.data.email,
            companyEmail: recipient.data.email,
            name: recipient.data.name || '',
            type: recipient.data.recipientType as IUserType,
            org_id: recipient.data.organizationId,
            source: 'recipient'
          });
          // eslint-disable-next-line no-empty
        } catch (err) {}
      }
    })
  );

  res.status(200).json({ message: 'Success!' });
}
