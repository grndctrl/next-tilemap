import { config } from 'utils/colors';
import { ChangeEvent, useState, useEffect, useRef } from 'react';

type InputRangeProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  colors?: {
    default: string;
    glow: string;
    active: string;
    activeGlow: string;
  };
};

const InputRange = ({ value, min, max, step, onChange, colors = config.default }: InputRangeProps) => {
  const [isPointerOver, togglePointerOver] = useState<boolean>(false);
  const inputRange = useRef<HTMLDivElement | null>(null);
  const [normalizedValue, setNormalizedValue] = useState<number>((value - min) / (max - min));
  const [position, setPosition] = useState<number>(0);
  const steps = Array.from({ length: Math.ceil(max / step) });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNormalizedValue((parseFloat(event.target.value) - min) / (max - min));
    onChange(event);
  };

  useEffect(() => {
    if (!inputRange?.current) return;

    const { width } = inputRange.current.getBoundingClientRect();
    const position = width * normalizedValue - normalizedValue * 16;

    setPosition(position);
  }, [normalizedValue]);

  return (
    <div
      ref={inputRange}
      onPointerEnter={() => togglePointerOver(true)}
      onPointerLeave={() => togglePointerOver(false)}
      className="relative flex-grow h-10 pointer-events-auto ui-element"
      style={{ color: isPointerOver ? colors.activeGlow : colors.glow }}
    >
      <input
        className="relative z-10 w-full"
        value={value}
        min={min}
        max={max}
        step={step}
        type="range"
        onChange={handleChange}
      />
      <div className="pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full bg-transparent border border-current h-9"
          style={{ color: isPointerOver ? colors.active : colors.default }}
        ></div>

        <div className="absolute inset-0 z-10 flex justify-between w-full h-full">
          {steps.map((_, index) => (
            <div key={index} className="flex justify-center w-4 pt-10">
              <div
                className="w-[1px] h-2 bg-current"
                style={{ color: isPointerOver ? colors.active : colors.default }}
              ></div>
            </div>
          ))}
        </div>
        <div
          className="absolute z-0 flex flex-col items-center justify-center w-4 bg-current left-1 h-7 top-1"
          style={{ width: `${position + 8}px`, color: isPointerOver ? colors.active : colors.default }}
        ></div>
      </div>
    </div>
  );
};

export default InputRange;
