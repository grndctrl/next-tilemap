import { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import useMeasure from 'react-use-measure';
import { config } from 'utils/colors';

type ProgressProps = {
  value: number;
  colors?: {
    default: string;
    glow: string;
  };
};

const Progress = ({ value, colors = config.default }: ProgressProps) => {
  // const { color, background, opacity } = useSpring({
  //   color: isPointerOver ? colors.active : colors.default,
  //   background: isPointerOver ? colors.activeGlow : colors.glow,
  //   config: { mass: 1, tension: 400, friction: 10, clamp: true },
  // });
  const [steps, setSteps] = useState<number[]>([]);
  const [ref, { width }] = useMeasure();

  useEffect(() => {
    const length = Math.floor(value * ((width - 16) / 16));
    setSteps(Array.from({ length }).map((_, index) => index));
  }, [value]);

  return (
    <div ref={ref} className="relative w-full ui-element" style={{ color: colors.glow }}>
      <div className="flex w-full h-12 p-2 border border-current" style={{ color: colors.default }}>
        {steps.map((step) => (
          <div key={step}>
            <div className="flex">
              <div
                className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
                style={{ color: colors.default }}
              ></div>
              <div
                className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
                style={{ color: colors.default }}
              ></div>
            </div>
            <div className="flex">
              <div
                className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
                style={{ color: colors.default }}
              ></div>
              <div
                className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
                style={{ color: colors.default }}
              ></div>
            </div>
            <div className="flex">
              <div
                className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
                style={{ color: colors.default }}
              ></div>
              <div
                className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
                style={{ color: colors.default }}
              ></div>
            </div>
            <div className="flex">
              <div
                className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
                style={{ color: colors.default }}
              ></div>
              <div
                className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
                style={{ color: colors.default }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
