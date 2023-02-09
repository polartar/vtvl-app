import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from 'services/auth/firebaseAdmin';

import { SignInToken } from './getSigninToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { encryptToken } = req.body;
  let signInToken: SignInToken;
  try {
    const cert = process.env.CUSTOM_TOKEN_PUBLIC_KEY?.replace(/\\n/g, '\n');
    signInToken = jwt.verify(encryptToken, cert || '') as SignInToken;
  } catch (err) {
    console.log(err);
    return {
      error: 'invalid token'
    };
  }

  const token = await firebaseAdmin?.auth().createCustomToken(signInToken.memberId);

  res.status(200).json({ ...signInToken, token: token, message: 'Success!' });
}
