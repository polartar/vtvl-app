interface IFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  isSubmitting: boolean;
  disabled?: boolean;
  message?: string | string[] | JSX.Element | JSX.Element[];
  success?: boolean;
  error?: boolean;
  padded?: boolean;
}
const Form = ({
  error = false,
  success = false,
  isSubmitting = false,
  message = '',
  padded = true,
  disabled = false,
  ...props
}: IFormProps) => {
  console.log('FORM IS SUBMITTING', isSubmitting);

  return (
    <form
      {...props}
      className={`form ${error ? 'form-error' : ''} ${success ? 'form-success' : ''} ${!padded ? 'p-0' : ''} ${
        props.className
      }`}>
      <fieldset disabled={isSubmitting || disabled} className={!padded ? 'no-padding' : ''}>
        {props.children}
      </fieldset>
      {message && (error || success) ? (
        <p className="form-message text-xs text-center pt-3 pb-2 overflow-hidden">{message}</p>
      ) : null}
    </form>
  );
};
export default Form;
