import { useState } from 'react';

interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange?: (value: any) => void;
}
const ToggleSwitch = ({ checked = false, onChange = () => {} }: ToggleSwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked);
  const handleChange = (e: any) => {
    setIsChecked((prev) => !prev);
    onChange(e.target.checked);
  };
  return (
    <label
      className={`rounded-full h-5 w-9 relative p-0.5 cursor-pointer ${isChecked ? 'bg-primary-900' : 'bg-gray-200'}`}>
      <div className={`row-center justify-end h-4 transition-all duration-300 ${isChecked ? 'w-full' : 'w-4'}`}>
        <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
      </div>
      <input type="checkbox" className="absolute opacity-0 -z-10" checked={isChecked} onChange={handleChange} />
    </label>
  );
};

export default ToggleSwitch;
