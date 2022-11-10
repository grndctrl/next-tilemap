import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { config } from 'utils/colors';

type GlowThingProps = {
  children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  colors?: {
    default?: string;
    glow?: string;
    active?: string;
    activeGlow?: string;
  };
};

const Toggle = ({ children, isActive = false, colors = config.default, onClick }: GlowThingProps) => {
  const [isPointerOver, togglePointerOver] = useState<boolean>(false);

  const { color, background, opacity } = useSpring({
    color: isActive || isPointerOver ? colors.active : colors.default,
    background: isActive || isPointerOver ? colors.activeGlow : colors.glow,
    opacity: isActive ? 1 : 0,
    config: { mass: 1, tension: 400, friction: 10, clamp: true },
  });

  return (
    <animated.div
      onPointerEnter={() => togglePointerOver(true)}
      onPointerLeave={() => togglePointerOver(false)}
      onClick={onClick}
      className="relative h-12 p-3 glow"
      style={{ color: background }}
    >
      <div className="absolute inset-0 border border-current" style={{ opacity: isActive ? 0 : 1 }}></div>
      <animated.div className="relative " style={{ color }}>
        {children}
      </animated.div>

      <animated.div
        className="absolute top-0 left-0 w-6 border-4 border-current h-1/2 border-r-transparent border-b-transparent"
        style={{ color }}
      ></animated.div>
      <animated.div
        className="absolute bottom-0 right-0 w-6 border-4 border-current h-1/2 border-l-transparent border-t-transparent"
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

export default Toggle;
