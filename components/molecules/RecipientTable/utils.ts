import { PropsWithChildren } from 'react';

export type EditableTypographyType = 'text' | 'address' | 'number' | 'select';

export type Recipient = { label: string; value: string };

export interface EditableTypographyProps<T extends string = string> {
  id: string;
  initialValue: T;
  type?: EditableTypographyType;
  placeholder?: string;
  autoFocus?: boolean;
  onChange?: (value: T) => void;
}

export const RecipientTableColumns = [
  {
    id: 'name',
    title: 'Name'
  },
  {
    id: 'address',
    title: 'Wallet Address'
  },
  {
    id: 'allocations',
    title: 'Token Allocations'
  },
  {
    id: 'type',
    title: 'Recipient Type'
  }
] as const;

export const RecipientTypes = [
  { label: 'Advisor', value: 'advisor' },
  { label: 'Founder', value: 'founder' },
  { label: 'Investor', value: 'investor' },
  { label: 'Employee', value: 'employee' }
] as Recipient[];

export const RecipientTypeIds = RecipientTypes.map(({ value }) => value);

export type RecipientType = typeof RecipientTypeIds[number];

export type RecipientTableRow = {
  id?: string;
  name: string;
  address: string;
  allocations: string;
  type?: RecipientType;
};

export interface RecipientTableProps extends PropsWithChildren {
  initialRows?: RecipientTableRow[];
  loading?: boolean;
  onReturn?: () => void;
  onContinue?: (rows: RecipientTableRow[]) => void;
}

export const thClassName = 'first:rounded-tl-xl last:rounded-tr-xl';
export const tdClassName = 'border-none p-2 max-w-[320px] min-w-[60px]';
export const tdTypographyProps = {
  size: 'caption',
  className: 'w-full flex items-center justify-center'
} as const;

export const emptyRow = {
  id: '',
  name: '',
  address: '',
  allocations: ''
} as RecipientTableRow;

export const getRecipient = (recipient: RecipientType) =>
  RecipientTypes.find(({ value }) => value.toLowerCase() === recipient.toLowerCase());
