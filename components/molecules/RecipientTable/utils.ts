import { PropsWithChildren } from 'react';
import type { Validation, ValidationResponse } from 'utils/validator';

export type EditableTypographyType = 'text' | 'address' | 'number' | 'select';

export type Recipient = { label: string; value: string };

export interface EditableTypographyProps<T extends string = string> {
  id: string;
  initialValue: T;
  type?: EditableTypographyType;
  placeholder?: string;
  autoFocus?: boolean;
  validations?: Validation[];
  onChange?: (value: T) => void;
}

export const RecipientTableColumns = [
  {
    id: 'name',
    title: 'Name',
    required: true
  },
  {
    id: 'email',
    title: 'Email',
    required: true
  },
  {
    id: 'address',
    title: 'Wallet Address',
    required: false
  },
  {
    id: 'allocations',
    title: 'Token Allocations',
    required: true
  },
  {
    id: 'type',
    title: 'Recipient Type',
    required: true
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
  email: string;
  address?: string;
  allocations: string;
  type?: RecipientType;
};

export type RecipientTableValidation = {
  name: ValidationResponse;
  email: ValidationResponse;
  address: ValidationResponse;
  allocations: ValidationResponse;
  // TODO add type
};

export interface RecipientTableProps extends PropsWithChildren {
  initialRows?: RecipientTableRow[];
  loading?: boolean;
  onReturn?: () => void;
  onContinue?: (rows: RecipientTableRow[], errors: string[]) => void;
}

export const thClassName = 'first:rounded-tl-xl last:rounded-tr-xl';
export const tdClassName = 'border-none max-w-[320px] min-w-[60px]';
export const tdInnerClassName = `${tdClassName} p-2`;
export const tdFillClassName = `${tdClassName} p-0`;

export const tdTypographyProps = {
  size: 'caption',
  className: 'w-full flex items-center justify-center overflow-hidden'
} as const;

export const emptyRow = {
  id: '',
  name: '',
  email: '',
  address: '',
  allocations: ''
} as RecipientTableRow;

export const initialValidationResponse = {
  name: {
    validated: true
  },
  email: {
    validated: true
  },
  address: {
    validated: true
  },
  allocations: {
    validated: true
  }
} as RecipientTableValidation;

export const getRecipient = (recipient: RecipientType) =>
  RecipientTypes.find(({ value }) => value.toLowerCase() === recipient.toLowerCase());
