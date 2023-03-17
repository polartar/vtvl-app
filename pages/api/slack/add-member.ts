import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchMemberByEmail } from 'services/db/member';
import { fetchOrg } from 'services/db/organization';
import { IOrganization } from 'types/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = req.body.email;
  const member = await fetchMemberByEmail(email);
  const now = Math.floor(new Date().getTime() / 1000);

  if (!process.env.SLACK_NEW_MEMBER_WEBHOOK_URL) {
    return res.status(400).send({ message: 'Please add Slack WebHook URL to env' });
  }

  if (member && member.createdAt && member.type === 'founder' && member.createdAt + 3 >= now) {
    let organization: IOrganization | undefined;
    if (member.org_id) {
      organization = await fetchOrg(member.org_id);
    }

    try {
      await axios.post(process.env.SLACK_NEW_MEMBER_WEBHOOK_URL, {
        username: member.name, // This will appear as user name who posts the message
        text: `${member.name} just joined our platform`,
        icon_emoji: ':new:', // User icon, you can also use custom icons here
        attachments: [
          {
            color: '#eed140', // color of the attachments sidebar.
            fields: [
              {
                title: 'User Email',
                value: member.email,
                short: true
              },
              {
                title: 'Organization',
                value: organization?.name,
                short: true
              }
            ]
          }
        ]
      });
      res.status(200).json({ message: 'Success!' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(200).json({ message: 'No new member' });
  }
}
