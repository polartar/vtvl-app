import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchOrg } from 'services/db/organization';
import { updateRecipient } from 'services/db/recipient';
import { IOrganization } from 'types/models';
import SendMail, { MailTemplates } from 'utils/email';

dotenv.config();

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const recipients = req.body.recipients;
  const symbol = req.body.symbol;
  const orgId = recipients[0]?.orgId;
  let organization: IOrganization | undefined;
  if (orgId) {
    organization = await fetchOrg(orgId);
  }
  await Promise.all(
    recipients.map(async (recipient: IRecipientToken) => {
      const { email, orgId, name, memberId } = recipient;

      if (!process.env.CUSTOM_TOKEN_PRIVATE_KEY) {
        return res.status(400).send({ message: 'Private key not exist' });
      }
      let token;
      try {
        token = GetRecipientToken(email, orgId, name, memberId, organization?.name || '');
      } catch (err: any) {
        return res.status(200).json({ message: err.message });
      }

      const emailLink = process.env.NEXT_PUBLIC_DOMAIN_NAME + '/recipient/create?token=' + token;
      try {
        await SendMail({
          to: email,
          data: { emailLink, tokenSymbol: symbol, name },
          subject: 'Join VTVL',
          templateId: MailTemplates.RecipientInvite
        });
        updateRecipient(recipient.memberId, {
          status: 'delivered'
        });
      } catch (err: any) {
        console.error(err.message);
      }
      return recipient;
    })
  );
  res.status(200).json({ message: 'Success!' });
}

export interface IRecipientToken extends JwtPayload {
  email: string;
  orgId: string;
  name: string;
  domain?: string;
  memberId: string;
  orgName: string;
}

const GetRecipientToken = (
  email: string,
  orgId: string,
  name: string,
  recipientId: string,
  orgName: string
): string => {
  const signInToken: IRecipientToken = {
    email,
    orgId,
    domain: process.env.NEXT_PUBLIC_DOMAIN_NAME || '',
    name,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: Math.floor(Date.now() / 1000),
    memberId: recipientId,
    orgName
  };

  const privateKey = process.env.CUSTOM_TOKEN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const token = jwt.sign(signInToken, privateKey || '', { algorithm: 'RS256', expiresIn: 3600 * 24 });
  return token;
};
