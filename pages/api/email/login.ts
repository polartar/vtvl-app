import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email } = req.body;
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/onboarding/select-user-type?email=${email}`,
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
