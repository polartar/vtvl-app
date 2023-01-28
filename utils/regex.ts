/**
 * The EVM address validation
 *
 * EMV contract address and wallet address should be validated
 *
 * Will return `true` if it's validated
 */
export const validateEVMAddress = (str: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/g).test(str);

/**
 * Validate the duplication of specific values in object array
 *
 * Will return `true` if it's duplicated
 */
export const validateDuplication = <T>(rows: Array<T>, key: keyof T) => {
  const raw = rows?.map((row) => String(row[key]).toLowerCase()) ?? [];
  return raw.some((item, idx) => raw.indexOf(item) != idx);
};

/**
 * Validate fields by provided condition
 *
 * Will return `true` if it's validated
 */
export const validate = <T>(rows: Array<T>, key: keyof T, condition: (value: T[keyof T]) => boolean) => {
  return (rows?.filter((row) => condition(row[key])) ?? []).length > 0;
};

/**
 * Validate object
 */
export const isBlankObject = (value: any) => {
  return Object.keys(value || {}).filter((key: string) => !!value[key]).length === 0;
};
