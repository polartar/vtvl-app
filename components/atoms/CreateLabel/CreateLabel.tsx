interface CreateLabelProps {
  inputValue: string;
}
const CreateLabel = ({ inputValue }: CreateLabelProps) => (
  <div className="row-center">
    <div className="row-center justify-center rounded-md border border-neutral-500 text-sm leading-3 h-4 w-4">
      <span className="-mt-0.5">+</span>
    </div>
    <span>
      <strong>Create</strong> {inputValue}
    </span>
  </div>
);

export default CreateLabel;
