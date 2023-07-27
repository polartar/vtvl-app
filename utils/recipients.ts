import { MultiValue } from 'react-select';
import { IRecipient } from 'types/models';
import { IRecipientForm } from 'types/models/recipient';

import { RECIPIENTS_TYPES } from './constants';

export const getRecipient = (recipient: IRecipientTypeValue) =>
  RECIPIENTS_TYPES.find(({ value }) => String(value).toLowerCase() === String(recipient).toLowerCase());

export const formatRecipientsDocToForm = (recipients: IRecipient[] | MultiValue<IRecipient>): IRecipientForm[] => {
  return recipients.map(
    (recipient) =>
      ({
        walletAddress: recipient.address,
        name: recipient.name,
        email: recipient.email,
        company: recipient?.organization?.name ?? '',
        allocations: Number(recipient.allocations),
        recipientType: [getRecipient(recipient.role)]
      } as IRecipientForm)
  );
};
