import { ChangeEvent, useState, useEffect, useRef } from 'react';

type InputRangeProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const InputRange = ({ value, min, max, step, onChange }: InputRangeProps) => {
  const inputRange = useRef<HTMLDivElement | null>(null);
  const [normalizedValue, setNormalizedValue] = useState<number>((parseFloat(value) - min) / (max - min));
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
    <div ref={inputRange} className="relative flex-grow h-10 group">
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
        <div className="absolute inset-0 z-10 flex flex-col justify-center w-full h-full px-[7px]">
          <div className="w-full h-[2px] bg-white"></div>
        </div>
        <div className="absolute inset-0 z-10 flex justify-between w-full h-full">
          {steps.map((_, index) => (
            <div key={index} className="flex justify-center w-4 pt-7">
              <div className="w-[2px] h-3 bg-slate-600"></div>
            </div>
          ))}
        </div>
        <div
          className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-4 h-10 bg-yellow-500 border-b-2 border-yellow-700 group-hover:bg-slate-200 group-hover:border-slate-400 "
          style={{ left: `${position}px` }}
        >
          <div className="flex items-start justify-between w-2 h-1">
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
          </div>
          <div className="flex items-center justify-between w-2 h-1">
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
          </div>
          <div className="flex items-end justify-between w-2 h-1">
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
            <div className="w-[2px] h-[2px] bg-yellow-700 group-hover:bg-slate-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputRange;
