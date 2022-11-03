import CryptoJS from "crypto-js";
import { DateTime } from "luxon";


const passphrase = "your secret passphrace to encode your token";

export interface SignInToken {
    uid: string,
    createdOnISO: string,
}

export const GetSignInToken = (uid: string): string => {
  const signInToken: SignInToken = {
    uid,
    createdOnISO: DateTime.now().toISO()
  };
  
  const json = JSON.stringify(signInToken);
  const encrypted = CryptoJS.AES.encrypt(json, passphrase).toString();
  const encrytedB64 = Buffer.from(encrypted, 'binary').toString('base64');

  return encrytedB64;
};

export const DecryptSignInToken = (encryptedB64SignInToken: string): SignInToken => {
  const encrypted = Buffer.from(encryptedB64SignInToken, 'base64').toString('binary');
  const json = CryptoJS.AES.decrypt(encrypted, passphrase).toString(CryptoJS.enc.Utf8);
  
  const signInToken = JSON.parse(json) as SignInToken;

  return signInToken;
};
