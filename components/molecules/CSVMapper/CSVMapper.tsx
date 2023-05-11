import Input from '@components/atoms/FormControls/Input/Input';
import SelectInput from '@components/atoms/FormControls/SelectInput/SelectInput';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { Fragment, useEffect, useState } from 'react';
import { SelectOptions } from 'types/shared';

interface ICSVMapperProps {
  headers: SelectOptions[];
  fields: SelectOptions[];
  onChange: (data: any) => void;
}

/**
 * Whenever this is in use, it is required to add an onChange to monitor the values of the mapping
 */
const CSVMapper = ({ headers, fields, onChange }: ICSVMapperProps) => {
  // Assign quick default values
  const defaultValues = fields.map((field) => {
    // Try to check if we can already select if similar labels
    const similar = headers.find((heading) => heading.label.toLowerCase() === field.label.toLocaleLowerCase());
    console.log('Field loop', field);
    return {
      vtvlField: field,
      csvField: similar || { label: 'Select a column header', value: '' }
    };
  });
  const [values, setValues] = useState([...defaultValues]);
  const options = [{ label: 'Select a column header', value: '' }, ...headers];

  // Updates the Select side of value in the mapper
  const handleSelectChange = (e: any, index: number) => {
    const newValue = e.target.selectedOptions[0].value;
    const findValue = options.find((option) => option.value === newValue);
    if (findValue) {
      setValues((prevValues) =>
        prevValues.map((val, vIndex) => {
          if (vIndex === index) {
            return { ...val, csvField: { ...findValue } };
          }
          return val;
        })
      );
    }
  };

  // Ensures that the values object is updated before triggering the onchange
  useEffect(() => {
    if (onChange) onChange(values);
  }, [values]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.length
        ? fields.map((field, fIndex) => (
            <Fragment key={`map-input-${fIndex}`}>
              <div className="flex flex-row items-center gap-3">
                <Input readOnly placeholder={field.label} value={values[fIndex].vtvlField.label} />
                <ArrowIcon className="w-4 h-4 fill-current text-neutral-300 transform rotate-180" />
              </div>
              <SelectInput
                options={options}
                value={values[fIndex].csvField.value}
                onChange={(e) => handleSelectChange(e, fIndex)}
              />
            </Fragment>
          ))
        : null}
    </div>
  );
};

export default CSVMapper;
