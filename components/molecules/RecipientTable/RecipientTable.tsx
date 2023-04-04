import Button from '@components/atoms/Button/Button';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@components/atoms/Icons';
import { Typography } from '@components/atoms/Typography/Typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select, { OnChangeValue } from 'react-select';
import { IRecipientType } from 'types/models/recipient';
import { RECIPIENTS_TYPES } from 'utils/constants';
import { getRecipient } from 'utils/recipients';
import { validate, validateDuplication, validateEVMAddress } from 'utils/regex';
import { formatNumber } from 'utils/token';
import { validate as validateSingleField } from 'utils/validator';

import { EditableTypography } from './EditableTypography';
import {
  RecipientTableColumns,
  RecipientTableProps,
  RecipientTableRow,
  emptyRow,
  tdFillClassName,
  tdInnerClassName,
  thClassName
} from './utils';

export const RecipientTable: React.FC<RecipientTableProps> = ({
  initialRows = [],
  loading = false,
  children,
  onReturn,
  onContinue
}) => {
  const [rows, setRows] = useState<RecipientTableRow[]>(initialRows);

  const totalAllocations = useMemo(() => rows?.reduce((val, row) => val + Number(row.allocations), 0) ?? 0, [rows]);

  const handleContinue = useCallback(() => {
    const newErrors = [];

    if (!rows?.length) {
      newErrors.push('At least one recipient must be added to proceed.');
    }

    const addresses = rows.filter((row) => Boolean(row.address));
    const hasDuplicatedAddress = validateDuplication(addresses, 'address');
    if (hasDuplicatedAddress) {
      newErrors.push('Recipient wallet address is duplicated.');
    }

    const hasInvalidAddress = validate(addresses, 'address', (value) => !validateEVMAddress(String(value)));
    if (hasInvalidAddress) {
      newErrors.push('Recipient wallet address is invalid.');
    }

    const hasEmptyName = validate(rows, 'name', (value) => !value);
    if (hasEmptyName) {
      newErrors.push('Recipient name is required field.');
    }

    const hasEmptyType = validate(rows, 'type', (value) => !value);
    if (hasEmptyType) {
      newErrors.push('Recipient type is required field.');
    }

    const hasEmptyAllocations = validate(rows, 'allocations', (value) => Number(value) <= 0);
    if (hasEmptyAllocations) {
      newErrors.push('Allocations should be greater than 0.');
    }

    const hasEmptyEmails = validate(rows, 'email', (value) => !value);
    if (hasEmptyEmails) {
      newErrors.push('Recipient email is the required field.');
    }

    onContinue?.(rows, newErrors);
  }, [rows, onContinue]);

  const handleAddNewRecipient = useCallback(() => {
    setRows((values) => [...values, { ...emptyRow, id: new Date().toString() }]);
  }, []);

  const handleRemoveRow = useCallback(
    (index: number) => () => {
      setRows((values) => values.filter((_, idx) => idx !== index));
    },
    []
  );

  const handleChange = useCallback(
    (index: number, field: string) => (value: string | number) => {
      setRows((values) => values.map((val, idx) => (idx === index ? { ...val, [field]: value } : val)));
    },
    []
  );

  const handleChangeRecipientType = useCallback(
    (index: number) => (newValue: OnChangeValue<IRecipientType, false>) => {
      setRows((values) => values.map((val, idx) => (idx === index ? { ...val, type: newValue?.value } : val)));
    },
    []
  );

  useEffect(() => {
    setRows(initialRows ?? []);
  }, [initialRows]);

  return (
    <div className="w-full">
      <div className="w-full border border-primary-200 rounded-xl mb-6">
        <table className="w-full table-fixed">
          <thead className="bg-neutral-100 border-b border-primary-200 overflow-hidden rounded-xl">
            {RecipientTableColumns.map((column) => (
              <th key={column.id} className={thClassName}>
                <label className={column.required ? 'required' : ''}>
                  <Typography size="caption" className="w-full flex items-center justify-center !mb-0">
                    {column.title}
                  </Typography>
                </label>
              </th>
            ))}
            <th className={`${thClassName} w-8`}></th>
          </thead>
          <tbody>
            {rows?.map((row, index) => (
              <tr key={`recipient-table-row-${row.id}`}>
                <td className={tdFillClassName}>
                  <EditableTypography
                    id={`${row.id}-name`}
                    initialValue={row.name}
                    autoFocus
                    type="text"
                    placeholder="eg. Vitalik Armstrong"
                    validations={['required']}
                    onChange={handleChange(index, 'name')}
                  />
                </td>
                <td className={tdFillClassName}>
                  <EditableTypography
                    id={`${row.id}-email`}
                    initialValue={row.email}
                    autoFocus
                    type="email"
                    placeholder="eg. vitalik@vtvl.io"
                    validations={['required', 'email']}
                    onChange={handleChange(index, 'email')}
                  />
                </td>
                <td className={tdFillClassName}>
                  <EditableTypography
                    id={`${row.id}-address`}
                    initialValue={String(row.address)}
                    autoFocus
                    type="address"
                    placeholder="0x69...6c15"
                    validations={['address']}
                    onChange={handleChange(index, 'address')}
                  />
                </td>
                <td className={tdFillClassName}>
                  <EditableTypography
                    id={`${row.id}-allocations`}
                    initialValue={row.allocations}
                    autoFocus
                    type="number"
                    placeholder="15,000"
                    validations={['required', 'number']}
                    onChange={handleChange(index, 'allocations')}
                  />
                </td>
                <td className={`${row.type ? tdInnerClassName : `${tdInnerClassName} bg-danger-50`}`}>
                  <Select
                    value={row.type ? getRecipient(row.type) : undefined}
                    options={RECIPIENTS_TYPES}
                    onChange={handleChangeRecipientType(index)}
                  />
                </td>
                <td className={tdInnerClassName}>
                  <button type="button" className="bg-transparent p-1" onClick={handleRemoveRow(index)}>
                    <TrashIcon className="w-6 h-6 m-auto" />
                  </button>
                </td>
              </tr>
            ))}

            {!!rows?.length && (
              <tr>
                <td colSpan={3} className={`${tdInnerClassName} py-4`}>
                  <Typography variant="inter" size="body" className="font-bold">
                    Token Allocations
                  </Typography>
                </td>
                <td colSpan={3} className={`${tdInnerClassName} py-4`}>
                  <Typography variant="inter" size="body" className="font-bold">
                    {formatNumber(+totalAllocations)}
                  </Typography>
                </td>
              </tr>
            )}

            {!rows?.length && (
              <tr>
                <td colSpan={5} className="text-center">
                  <Typography variant="inter" size="body">
                    No recipient data
                  </Typography>
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={5} className="text-center">
                  <Typography variant="inter" size="body">
                    Loading Recipient data
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {children ?? <></>}

      <button
        type="button"
        className="flex items-center gap-2 mb-8 bg-transparent hover:bg-secondary-100"
        disabled={loading}
        onClick={handleAddNewRecipient}>
        <PlusIcon className="w-6 h-6 text-secondary-900" />
        <Typography variant="inter" size="body" className="text-secondary-900">
          Add recipient
        </Typography>
      </button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 bg-transparent hover:bg-neutral-100"
          disabled={loading}
          onClick={onReturn}>
          <ArrowLeftIcon className="w-6 h-6" />
          <Typography variant="inter" size="body">
            Back
          </Typography>
        </button>
        <Button type="button" outline primary disabled={loading} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};
