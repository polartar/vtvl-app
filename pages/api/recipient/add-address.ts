import { ethers } from 'ethers';
import { IVestingSchedule } from 'interfaces/vestingSchedule';
import type { NextApiRequest, NextApiResponse } from 'next';
// import { editRecipient, fetchRecipient } from 'services/db/recipient';
import { fetchVesting } from 'services/db/vesting';
import { IVesting } from 'types/models';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { signature, recipientId, address } = req.body;

//   const sig = ethers.utils.splitSignature(signature);
//   const recipient = await fetchRecipient(recipientId);
//   if (!recipient) {
//     return { status: 400, response: 'Not found recipient' };
//   }
//   const vesting = await fetchVesting(recipient.vestingId);
//   if (!vesting) {
//     return { status: 400, response: 'Not found vesting schedule' };
//   }

//   const message = generateMessage(vesting, address);

//   const x = ethers.utils.verifyMessage(message, sig);

//   if (!x || x.toLowerCase() !== address.toLowerCase()) {
//     return res.status(400).json({ message: 'Invalid signature' });
//   }

//   editRecipient(recipientId, {
//     ...recipient,
//     walletAddress: address,
//     status: 'accepted'
//   });

//   res.status(200).json({ message: 'Success!' });
// }

// export const generateMessage = (vesting: IVestingSchedule, address: string): string => {
//   const obj = {
//     name: vesting.name,
//     recipient: address,
//     organizationId: vesting.organizationId,
//     startDateTime: vesting.startedAt,
//     endDateTime: vesting.endedAt,
//     cliffDuration: vesting.cliffDuration,
//     cliffDurationNumber: vesting.cliffDuration,
//     // lumpSumReleaseAfterCliff: vesting.lumpSumReleaseAfterCliff,
//     releaseFrequency: vesting.releaseFrequency,
//     tokenId: vesting.tokenId,
//     amountToBeVested: vesting.amount
//   };
//   return JSON.stringify(obj);
// };
