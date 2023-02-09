import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import SendMail, { MailTemplates } from 'utils/email';

import { GetSignInToken } from '../token/getCustomToken';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { memberId, email, type, orgId, orgName, name } = req.body;

  if (!process.env.CUSTOM_TOKEN_PRIVATE_KEY) {
    return res.status(400).send({ message: 'Private key not exist' });
  }
  let token;
  try {
    token = GetSignInToken(memberId, email, type, orgId, orgName, name);
  } catch (err: any) {
    return res.status(200).json({ message: err.message });
  }
  const emailLink = process.env.NEXT_PUBLIC_DOMAIN_NAME + '/member?token=' + token;
  await SendMail({
    to: email,
    data: { emailLink, orgName, name },
    subject: 'Join VTVL',
    templateId: MailTemplates.TeammateInvite
  });
  res.status(200).json({ message: 'Success!' });
}
