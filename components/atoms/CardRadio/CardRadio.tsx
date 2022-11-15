import styled from '@emotion/styled';
import React from 'react';

const Label = styled.label<{ disabled?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 30px;

  width: 275px;
  padding: 60px 25px 25px 25px;
  border-radius: 26px;
  border: 2px solid transparent;

  font-size: 14px;
  color: #101828;

  cursor: pointer;
  transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease;

  ${({ disabled }) =>
    disabled
      ? 'opacity: 0.6;'
      : '&:hover, &.selected { border-color: #1b369a; box-shadow: 0 10px 20px -15px rgba(56, 56, 56, 0.6); transform: translateY(-2px);}'}
`;

const Check = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background-color: #dfe6ff;
  border: 1px solid #1b369a;

  &.selected {
    background-color: #1b369a;
  }
`;

const RadioImage = styled.img`
  height: 156px;
`;

interface CardRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  image: string;
  value: string;
  name: string;
  label: string | string[] | JSX.Element | JSX.Element[];
  onClick?: () => void;
}

/**
 * UI component for a radio group's single item
 */
const CardRadio = ({ image, label, value, name, ...props }: CardRadioProps) => {
  // const [selected, setSelected] = useState('');
  return (
    <Label disabled={props.disabled} className={`card-radio ${props.checked ? 'selected' : ''}`}>
      <RadioImage src={image} alt={name} aria-hidden="true" />
      <p className="font-semibold h-11">{label}</p>
      <Check className={props.checked ? 'selected' : ''}>
        {props.checked ? <img src="/icons/check.svg" alt={`${value} selected`} /> : null}
      </Check>
      <input
        type="radio"
        value={value}
        {...props}
        name={name}
        className="absolute opacity-0 -z-10"
        onChange={props.onChange}
      />
    </Label>
  );
};

export default CardRadio;
