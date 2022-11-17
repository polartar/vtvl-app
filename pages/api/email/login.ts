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
  const url = `${baseUrl}/${
    newUser === true ? `onboarding/select-user-type?email=${email}&newUser=${newUser}` : `dashboard?email=${email}`
  }`;

  const actionCodeSettings = {
    url,
    handleCodeInApp: true
  };

  const emailLink = await firebaseAdmin?.auth().generateSignInWithEmailLink(email, actionCodeSettings);
  await SendMail({
    to: email,
    data: { emailLink },
    subject: 'Login to VTVL',
    templateId: MailTemplates.Login
  });
  res.status(200).json({ message: 'Success!' });
}
