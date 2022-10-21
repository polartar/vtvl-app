/**
 * Converts a single label item into an option with a label and value -- to be used on select inputs
 * values are converted into lower camel case
 */
export const convertLabelToOption = (label: string) => ({
  label,
  value: label
    .toLocaleLowerCase()
    .split(' ')
    .map((word, wIndex) => {
      return wIndex && word ? word[0].toUpperCase() + word.substring(1) : word;
    })
    .join('')
});

/**
 * Converts a list of items into options for the select input
 */
export const convertAllToOptions = (data: string[]) => data.map((item) => convertLabelToOption(item));
