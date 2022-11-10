import { ReactNode, useEffect, useState } from 'react';
import { config } from 'utils/colors';

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
  colors?: {
    default: string;
    glow: string;
    active: string;
    activeGlow: string;
  };
};

const Button = ({ onClick, children, colors = config.default }: ButtonProps) => {
  const [isPointerOver, togglePointerOver] = useState<boolean>(false);
  const [isActive, toggleActive] = useState<boolean>(false);

  return (
    <div
      onClick={onClick}
      onPointerDown={() => toggleActive(true)}
      onPointerUp={() => toggleActive(false)}
      onPointerEnter={() => togglePointerOver(true)}
      onPointerLeave={() => togglePointerOver(false)}
      className="relative h-12 p-3 ui-element"
      style={{ color: isActive || isPointerOver ? colors.activeGlow : colors.glow }}
    >
      <div
        className="absolute inset-0 border border-current"
        style={{ opacity: isActive ? 0 : 1, color: isActive || isPointerOver ? colors.active : colors.default }}
      ></div>
      <div
        className="relative text-center"
        style={{ color: isActive || isPointerOver ? colors.active : colors.default }}
      >
        {children}
      </div>

      <div
        className="absolute inset-0 border-4 border-current border-r-transparent border-l-transparent"
        style={{ color: isActive || isPointerOver ? colors.active : colors.default }}
      ></div>

      <div style={{ opacity: isActive ? 1 : 0 }}>
        <div
          className="absolute top-0 left-0 right-0 border-4 border-current h-1/2 border-b-transparent"
          style={{ color: isActive || isPointerOver ? colors.active : colors.default }}
        ></div>
        <div
          className="absolute bottom-0 left-0 right-0 border-4 border-current h-1/2 border-t-transparent"
          style={{ color: isActive || isPointerOver ? colors.active : colors.default }}
        ></div>
      </div>
    </div>
  );
};

export default Button;
