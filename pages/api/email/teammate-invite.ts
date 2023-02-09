import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

import { GetSignInToken } from '../token/getSigninToken';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { memberId, email, type, orgId, orgName, name } = req.body;

  const token = GetSignInToken(memberId, email, type, orgId, orgName, name);
  const emailLink = process.env.NEXT_PUBLIC_DOMAIN_NAME + '/member?token=' + token;
  await SendMail({
    to: email,
    data: { emailLink, orgName, name },
    subject: 'Join VTVL',
    templateId: MailTemplates.TeammateInvite
  });
  res.status(200).json({ message: 'Success!' });
}
