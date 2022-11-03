import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import SendMail, { MailTemplates } from 'utils/email';

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email, type, orgId, orgName, name } = req.body;

  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/onboarding/select-user-type?type=${type}&orgId=${orgId}&name=${name}`,
    handleCodeInApp: true
  };

  const emailLink = await firebaseAdmin?.auth().generateSignInWithEmailLink(email, actionCodeSettings);
  console.log('sign in link generated is ', emailLink);
  await SendMail({
    to: email,
    data: { emailLink, orgName, name },
    subject: 'Join VTVL',
    templateId: MailTemplates.TeammateInvite
  });
  res.status(200).json({ message: 'Success!' });
}
