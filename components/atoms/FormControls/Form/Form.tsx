interface IFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  isSubmitting: boolean;
  message?: string | string[] | JSX.Element | JSX.Element[];
  success?: boolean;
  error?: boolean;
}
const Form = ({ error = false, success = false, isSubmitting = false, message = '', ...props }: IFormProps) => {
  console.log('FORM IS SUBMITTING', isSubmitting);

  return (
    <form
      {...props}
      className={`form ${error ? 'form-error' : ''} ${success ? 'form-success' : ''} ${props.className}`}>
      <fieldset disabled={isSubmitting}>{props.children}</fieldset>
      {message && (error || success) ? <p className="form-message text-xs text-center pt-3 pb-2">{message}</p> : null}
    </form>
  );
};
export default Form;
