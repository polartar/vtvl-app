import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email, type, orgId, orgName, name } = req.body;
  const baseUrl = req.headers.host ? `http://${req.headers.host}` : process.env.NEXT_PUBLIC_DOMAIN_NAME;
  const actionCodeSettings = {
    url: `${baseUrl}/member?email=${email}&type=${type}&orgId=${orgId}&name=${name}`,
    handleCodeInApp: true
  };

  const emailLink = await firebaseAdmin?.auth().generateSignInWithEmailLink(email, actionCodeSettings);
  await SendMail({
    to: email,
    data: { emailLink, orgName, name },
    subject: 'Join VTVL',
    templateId: MailTemplates.TeammateInvite
  });
  res.status(200).json({ message: 'Success!' });
}
