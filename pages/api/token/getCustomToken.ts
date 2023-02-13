import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';
import { INVITEE_EXPIRED_TIME } from 'utils/constants';

export interface SignInToken extends JwtPayload {
  memberId: string;
  email: string;
  type: string;
  orgId: string;
  orgName: string;
  name: string;
}

export const GetSignInToken = (
  memberId: string,
  email: string,
  type: string,
  orgId: string,
  orgName: string,
  name: string
): string => {
  const signInToken: SignInToken = {
    memberId: memberId ? memberId : crypto.randomBytes(24).toString('hex'),
    email,
    type,
    orgId,
    orgName,
    name,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: Math.floor(Date.now() / 1000)
  };

  const privateKey = process.env.CUSTOM_TOKEN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const token = jwt.sign(signInToken, privateKey || '', { algorithm: 'RS256', expiresIn: INVITEE_EXPIRED_TIME });
  return token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { encryptToken } = req.body;
  let signInToken: SignInToken;
  try {
    const cert = process.env.CUSTOM_TOKEN_PUBLIC_KEY?.replace(/\\n/g, '\n');
    signInToken = jwt.verify(encryptToken, cert || '') as SignInToken;
    const token = await firebaseAdmin?.auth().createCustomToken(signInToken.memberId);

    res.status(200).json({ ...signInToken, token: token, message: 'Success!' });
  } catch (err: any) {
    console.log(err);
    res.status(400).send({ message: err.message });
  }
}
