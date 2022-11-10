import { ReactNode, useState } from 'react';
import { useSpring, animated } from 'react-spring';
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

  const { color, background, opacity } = useSpring({
    color: isPointerOver ? colors.active : colors.default,
    background: isPointerOver ? colors.activeGlow : colors.glow,
    opacity: isActive ? 1 : 0,
    config: { mass: 1, tension: 400, friction: 10, clamp: true },
  });

  return (
    <animated.div
      onClick={onClick}
      onPointerDown={() => toggleActive(true)}
      onPointerUp={() => toggleActive(false)}
      onPointerEnter={() => togglePointerOver(true)}
      onPointerLeave={() => togglePointerOver(false)}
      className="relative h-12 p-3 glow"
      style={{ color: background }}
    >
      <div className="absolute inset-0 border border-current" style={{ opacity: isActive ? 0 : 1 }}></div>
      <animated.div className="relative " style={{ color }}>
        {children}
      </animated.div>

      <animated.div
        className="absolute inset-0 border-4 border-current border-r-transparent border-l-transparent"
        style={{ color }}
      ></animated.div>

      <animated.div style={{ opacity }}>
        <animated.div
          className="absolute top-0 left-0 right-0 border-4 border-current h-1/2 border-b-transparent"
          style={{ color }}
        ></animated.div>
        <animated.div
          className="absolute bottom-0 left-0 right-0 border-4 border-current h-1/2 border-t-transparent"
          style={{ color }}
        ></animated.div>
      </animated.div>
    </animated.div>
  );
};

export default Button;
