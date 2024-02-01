import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const vestingName = req.body.vestingName;
  const organization = req.body.organization;

  if (!process.env.SLACK_NEW_USER_WEBHOOK_URL) {
    return res.status(400).send({ message: 'Please add a Slack WebHook URL to env' });
  }

  try {
    await axios.post(process.env.SLACK_NEW_USER_WEBHOOK_URL, {
      username: organization,
      text: `${organization} deployed a schedule "${vestingName}"`,
      icon_emoji: ':new:'
    });
    res.status(200).json({ message: 'Success!' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
