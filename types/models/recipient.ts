export interface IRecipient {
  vestingId: string;
  organizationId: string;
  name: string;
  email: string;
  company?: string;
  allocations: string;
  walletAddress: string;
  recipientType: IRecipientTypeValue;
  status?: 'accepted';
}

export interface IRecipientForm {
  walletAddress: string;
  name: string;
  email: string;
  company: string;
  recipientType: IRecipientType[];
  allocations?: number;
}

export interface IRecipientType {
  label: string | number;
  value: string | number;
}

export interface IRecipientFormState {
  recipients: IRecipientForm[];
}

export interface IRecipientDoc {
  id: string;
  data: IRecipient;
}
