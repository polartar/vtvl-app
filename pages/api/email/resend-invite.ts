import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import { fetchInviteeByEmail, fetchMemberByEmail } from 'services/db/member';
import { PUBLIC_DOMAIN_NAME, WEBSITE_EMAIL, WEBSITE_NAME } from 'utils/constants';
import SendMail, { MailTemplates } from 'utils/email';

import { GetSignInToken, SignInToken } from '../token/getCustomToken';

dotenv.config();

type Data = {
  message: string;
};

const checkMemberExist = async (email: string) => {
  if (firebaseAdmin) {
    const member = await fetchMemberByEmail(email);
    if (member) {
      return true;
    } else {
      const invitee = await fetchInviteeByEmail(email);
      if (invitee) {
        return true;
      }
    }
    return false;
  } else {
    throw new Error('Firebase admin not initialized');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { encryptToken, email, websiteName, websiteEmail, emailTemplate } = req.body;

  let token;

  try {
    const payload = jwt.decode(encryptToken) as SignInToken;
    if (email !== payload.email) {
      return res.status(403).json({ message: 'Wrong email' });
    }

    if (payload.domain !== PUBLIC_DOMAIN_NAME) {
      return res.status(403).json({ message: 'Wrong domain' });
    }

    token = GetSignInToken(payload.memberId, payload.email, payload.type, payload.orgId, payload.orgName, payload.name);
    if (!(await checkMemberExist(payload.email))) {
      return res.status(403).json({ message: 'Not authorized email' });
    }

    const emailLink = `${PUBLIC_DOMAIN_NAME}/magic-link-verification?redir=${encodeURIComponent(
      '/member?token=' + token
    )}`;
    await SendMail({
      to: payload.email,
      data: { emailLink, orgName: payload.orgName, name: payload.name, ...emailTemplate },
      subject: `Join ${websiteName || WEBSITE_NAME}`,
      websiteName: websiteName || WEBSITE_NAME,
      websiteEmail: websiteEmail || WEBSITE_EMAIL,
      templateId: MailTemplates.ThemedTeamInvite
    });
    res.status(200).json({ message: 'Success!' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
