import { Typography } from '@components/atoms/Typography/Typography';
import useToggle from 'hooks/useToggle';
import React, { useCallback, useMemo, useState } from 'react';
import { truncateComma } from 'utils';
import { formatNumber } from 'utils/token';
import { validate } from 'utils/validator';
import { truncateAddress } from 'utils/web3';

import { EditableTypographyProps, EditableTypographyType, tdTypographyProps } from './utils';

const formatOutput = (value: string | number, type: EditableTypographyType) => {
  switch (type) {
    case 'address':
      return truncateAddress(String(value));
    case 'number':
      return formatNumber(Number(truncateComma(String(value))));
    default:
      return value;
  }
};

export const EditableTypography = ({
  id = '',
  initialValue,
  type = 'text',
  placeholder = '',
  autoFocus = false,
  validations = [],
  onChange
}: EditableTypographyProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const [editable, , setEditable] = useToggle(false);
  const [isError, , setIsError] = useToggle(false);

  const inputClassName = useMemo(
    () => ['w-full rounded-none .inter text-caption leading-caption p-2 outline-none'].join(' '),
    []
  );

  const handleUpdate = useCallback(() => {
    setEditable(false);
    const newValue = type === 'number' ? truncateComma(value) : value;
    onChange?.(newValue);

    const validationResponses = validate(newValue, validations);
    setIsError(validationResponses.length > 0);
  }, [type, value, setEditable, onChange, validations]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  return editable ? (
    <input
      id={`recipient-col-${id}`}
      type="text"
      className={inputClassName}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={handleChange}
      onBlur={handleUpdate}
    />
  ) : (
    <button
      type="button"
      className={`w-full rounded-none min-h-[55px] ${isError ? 'bg-danger-50' : 'bg-transparent'}`}
      onClick={() => setEditable(true)}>
      <Typography {...tdTypographyProps}>{formatOutput(value, type)}</Typography>
    </button>
  );
};
