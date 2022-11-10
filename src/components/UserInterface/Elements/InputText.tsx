import { ChangeEvent, useState } from 'react';
import { config } from 'utils/colors';

type InputTextProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  colors?: {
    default: string;
    glow: string;
    active: string;
    activeGlow: string;
  };
};

const InputText = ({ value, onChange, colors = config.default }: InputTextProps) => {
  const [isPointerOver, togglePointerOver] = useState<boolean>(false);
  const [isActive, toggleActive] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };
  return (
    <div
      onPointerEnter={() => togglePointerOver(true)}
      onPointerLeave={() => togglePointerOver(false)}
      className="w-full ui-element"
      style={{ color: isPointerOver || isActive ? colors.activeGlow : colors.glow }}
    >
      <input
        className="w-full h-12 px-2 bg-transparent border border-current"
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => toggleActive(true)}
        onBlur={() => toggleActive(false)}
        style={{ color: isPointerOver || isActive ? colors.active : colors.default }}
      />
    </div>
  );
};

export default InputText;
