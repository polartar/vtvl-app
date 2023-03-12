import dotenv from 'dotenv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import { PUBLIC_DOMAIN_NAME } from 'utils/constants';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email, newUser, websiteName, websiteEmail } = req.body;
  const url = `${PUBLIC_DOMAIN_NAME}/${
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
    subject: `Login to ${websiteName ?? 'VTVL'}`,
    websiteName,
    websiteEmail,
    templateId: MailTemplates.Login
  });
  res.status(200).json({ message: 'Success!' });
}
