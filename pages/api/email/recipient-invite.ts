import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { INVITEE_EXPIRED_TIME } from 'utils/constants';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const recipients = req.body.recipients;
  await Promise.all(
    recipients.map(async (recipient: IRecipientToken) => {
      const { email, type, orgId, name } = recipient;

      if (!process.env.CUSTOM_TOKEN_PRIVATE_KEY) {
        return res.status(400).send({ message: 'Private key not exist' });
      }
      let token;
      try {
        token = GetRecipientToken(email, type, orgId, name);
      } catch (err: any) {
        return res.status(200).json({ message: err.message });
      }

      const emailLink = process.env.NEXT_PUBLIC_DOMAIN_NAME + '/recipient?token=' + token;

      return await SendMail({
        to: email,
        data: { emailLink, orgName: 'VTVL', name },
        subject: 'Join VTVL',
        templateId: MailTemplates.TeammateInvite
      });
    })
  );
  res.status(200).json({ message: 'Success!' });
}

export interface IRecipientToken extends JwtPayload {
  email: string;
  type: string;
  orgId: string;
  name: string;
  domain?: string;
}

const GetRecipientToken = (email: string, type: string, orgId: string, name: string): string => {
  const signInToken: IRecipientToken = {
    email,
    type,
    orgId,
    domain: process.env.NEXT_PUBLIC_DOMAIN_NAME || '',
    name,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: Math.floor(Date.now() / 1000)
  };

  const privateKey = process.env.CUSTOM_TOKEN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const token = jwt.sign(signInToken, privateKey || '', { algorithm: 'RS256', expiresIn: INVITEE_EXPIRED_TIME });
  return token;
};
