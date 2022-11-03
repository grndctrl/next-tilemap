import { ChangeEvent } from 'react';

type InputTextProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const InputText = ({ value, onChange }: InputTextProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };
  return (
    <input
      className="w-full p-2 text-yellow-500 bg-transparent border-2 focus:text-slate-200 border-slate-200"
      type="text"
      value={value}
      onChange={handleChange}
    />
  );
};

export default InputText;
