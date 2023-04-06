import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import { fetchAllMembers, newMember } from 'services/db/member';
import { fetchAllRecipientsWithId } from 'services/db/recipient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { emails } = req.body;

  const recipients = (await fetchAllRecipientsWithId()).filter((recipient) => emails.includes(recipient.data.email));
  const members = await fetchAllMembers();
  const memberEmails = members.map((member) => member.email);
  await Promise.all(
    recipients.map(async (recipient) => {
      if (!memberEmails.includes(recipient.data.email)) {
        const user = await firebaseAdmin?.auth().createUser({
          email: recipient.data.email,
          displayName: recipient.data.name
        });
        return await newMember(String(user?.uid), {
          email: recipient.data.email,
          companyEmail: recipient.data.email,
          name: recipient.data.name || '',
          type: recipient.data.recipientType,
          org_id: recipient.data.organizationId
        });
      }
    })
  );

  res.status(200).json({ message: 'Success!' });
}
