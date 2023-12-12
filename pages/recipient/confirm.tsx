import RecipientApiService from '@api-services/RecipientApiService';
import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Input from '@components/atoms/FormControls/Input/Input';
import { Typography } from '@components/atoms/Typography/Typography';
import useAuth from '@hooks/useAuth';
import useSafePush from '@hooks/useSafePush';
import { useAuthContext } from '@providers/auth.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useAuth as useAuthStore } from '@store/useAuth';
import { toUTCString } from '@utils/date';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
// import { generateMessage } from 'pages/api/recipient/add-address';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MESSAGES } from 'utils/messages';

const SIGN_MESSAGE_TEMPLATE = (address: string, utcTimeString: UTCString) =>
  `VTVL uses cryptographic signatures instead of passwords to verify that you are the owner of this address. The wallet address is ${
    address /* wallet: 0xab12 */
  } and the time is ${utcTimeString /* 2022-06-01 16:47:55 UTC */}.`;

const RecipientCreate: NextPage = () => {
  const { account, library } = useWeb3React();
  const { recipient } = useAuthContext();
  const { save: saveAuth } = useAuthStore();
  const { authorizeUser } = useAuth(); // hook

  const router = useRouter();
  const { safePush } = useSafePush();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setTransactionStatus } = useTransactionLoaderContext();

  // useEffect(() => {
  //   if (recipient && recipient && recipient.address) {
  //     safePush('/claim-portal');
  //   }
  // }, [recipient, router, recipient?.address]);

  const onSign = async () => {
    if (!account || !library) {
      return;
    }
    if (!recipient || !recipient?.id) {
      safePush('/claim-portal');
    }
    setIsSubmitting(true);

    const time = toUTCString();
    const message = SIGN_MESSAGE_TEMPLATE(account, time);

    let signature;
    try {
      signature = await library.provider.request({
        method: 'personal_sign',
        params: [message, account],
        jsonrpc: '2.0'
      });
      toast.success(MESSAGES.WALLET.SIGNED);
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setTransactionStatus('REJECTED');
      } else {
        setTransactionStatus('ERROR');
      }
      setIsSubmitting(false);
      toast.error(MESSAGES.WALLET.REJECT);
      return;
    }
    try {
      const token = router.query.code;
      const response = await RecipientApiService.acceptInvitation({
        code: token as string,
        wallet: {
          address: account,
          signature,
          utcTime: time
        }
      });

      saveAuth(response);
      // Authorize the user and handles redirection
      await authorizeUser();
    } catch (err) {
      toast.error('The signature is invalid');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl px-9 py-10 text-center">
      <div>
        <h1 className=" font-semibold mb-4 text-neutral-400">Your Schedule</h1>
      </div>
      <div className="panel w-full  text-left">
        <div className="text-center flex items-center flex-col mb-5">
          <Image src={'/icons/wallet-address.png'} alt="company-logo" width={133} height={133} className="" />
          <Typography variant="inter" size="title" className="font-semibold">
            Confirm wallet address
          </Typography>
        </div>
        <Typography variant="inter" size="body" className=" text-neutral-400">
          Please confirm we have your correct wallet
        </Typography>
        <Input label="" type="email" disabled value={account || ''} />
        <Chip
          label={
            <div className="flex flex-row items-center gap-2">
              <WarningIcon className="w-4 h-4 flex-shrink-0" />
              <span className=" whitespace-pre-line">
                Please note that upon signing and approving, your tokens will be distributed to this wallet address and
                cannot be changed
              </span>
            </div>
          }
          color="warningAlt"
          rounded
          className="mt-6"
        />
        <hr className="my-6" />
        <div className="flex flex-row justify-center items-center ">
          <Button className="primary rounded-lg" onClick={() => onSign()} loading={isSubmitting}>
            Sign & approve
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipientCreate;
