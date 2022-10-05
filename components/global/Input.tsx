import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string;
  className?: string;
}

/**
 * Form inputs should be structured inside a label
 * ```
 * <label className="required">
 *  <span>Organization name</span>
 *  <input type="text" />
 * </label>
 * ```
 * This component mimics the default input and already contains the a11y and label.
 * To use, simply use the `<Input />` component as a regular `<input />` one.
 */
export const Input = ({
  label = "",
  required = false,
  className = "",
  ...props
}: InputProps) => {
  return (
    <label className={`${required ? "required" : ""} ${className}`}>
      {label ? <span>{label}</span> : null}
      <input type="text" {...props} />
    </label>
  );
};
