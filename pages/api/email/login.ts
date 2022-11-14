import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email, newUser } = req.body;
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_NAME;

  const actionCodeSettings = {
    url: `${baseUrl}/onboarding/select-user-type?email=${email}&newUser=${newUser}`,
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
