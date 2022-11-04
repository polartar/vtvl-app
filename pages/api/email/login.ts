import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email } = req.body;
  // const baseUrl = req.headers.host ? `http://${req.headers.host}` : process.env.NEXT_PUBLIC_DOMAIN_NAME;
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_NAME;
  console.log('base url here i s ', baseUrl);
  console.log('coninue url here i s ', `${`${baseUrl}/onboarding/select-user-type?email=${email}`}`);

  const actionCodeSettings = {
    url: `${baseUrl}/onboarding/select-user-type?email=${email}`,
    handleCodeInApp: true
  };

  const emailLink = await firebaseAdmin?.auth().generateSignInWithEmailLink(email, actionCodeSettings);
  console.log('sign in link generated is ', emailLink);
  await SendMail({
    to: email,
    data: { emailLink },
    subject: 'Login to VTVL',
    templateId: MailTemplates.Login
  });
  res.status(200).json({ message: 'Success!' });
}
