import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PUBLIC_DOMAIN_NAME, WEBSITE_EMAIL, WEBSITE_NAME } from 'utils/constants';
import SendMail, { MailTemplates } from 'utils/email';

import { GetSignInToken } from '../token/getCustomToken';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { memberId, email, type, orgId, orgName, name, websiteName, websiteEmail, emailTemplate } = req.body;

  if (!process.env.CUSTOM_TOKEN_PRIVATE_KEY) {
    return res.status(400).send({ message: 'Private key not exist' });
  }
  let token;
  try {
    token = GetSignInToken(memberId, email, type, orgId, orgName, name);
  } catch (err: any) {
    return res.status(200).json({ message: err.message });
  }
  const emailLink = encodeURI(
    `${PUBLIC_DOMAIN_NAME}/magic-link-verification?redir=${encodeURIComponent('/member?token=' + token)}`
  );
  await SendMail({
    to: email,
    data: { emailLink, orgName, name, ...emailTemplate },
    subject: `Join ${websiteName || WEBSITE_NAME}`,
    websiteName: websiteName || WEBSITE_NAME,
    websiteEmail: websiteEmail || WEBSITE_EMAIL,
    templateId: MailTemplates.ThemedTeamInvite
  });
  res.status(200).json({ message: 'Success!' });
}
