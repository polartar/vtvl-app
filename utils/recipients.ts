import { MultiValue } from 'react-select';
import { IRecipientDoc } from 'types/models';
import { IRecipientForm } from 'types/models/recipient';

import { RECIPIENTS_TYPES } from './constants';

export const getRecipient = (recipient: IRecipientTypeValue) =>
  RECIPIENTS_TYPES.find(({ value }) => String(value).toLowerCase() === String(recipient).toLowerCase());

export const formatRecipientsDocToForm = (
  recipients: IRecipientDoc[] | MultiValue<IRecipientDoc>
): IRecipientForm[] => {
  return recipients.map(
    (recipient) =>
      ({
        walletAddress: recipient.data.walletAddress,
        name: recipient.data.name,
        email: recipient.data.email,
        company: recipient.data.company ?? '',
        allocations: Number(recipient.data.allocations),
        recipientType: [getRecipient(recipient.data.recipientType)]
      } as IRecipientForm)
  );
};
