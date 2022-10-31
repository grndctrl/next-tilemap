import type { NextPage } from 'next';
import { ChangeEvent, useRef, useState } from 'react';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { useWorld } from 'core/World';

const Home: NextPage = () => {
  // const { generateWorld } = useWorld();
  const [seed, setSeed] = useState<string>(Math.random().toString().slice(2, 10));
  const [size, setSize] = useState<string>(Math.random().toString());

  const handleSeedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeed(event.target.value);
  };

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSize(event.target.value);
  };

  const handleClick = () => {
    console.log(seed, size);
    // generateWorld();
  };

  return (
    <div className="fixed flex items-center justify-center w-full h-screen bg-amber-50">
      <div className="flex flex-col p-20 rounded-xl bg-slate-300">
        <div className="my-8">
          <input type="text" value={seed} onChange={handleSeedChange} />
        </div>
        <div className="relative my-8">
          <input value={size} min="8" max="32" step="8" type="range" onChange={handleRangeChange} />
        </div>
        <div className="relative my-8">
          <button className="p-4 bg-white" onClick={handleClick}>
            start
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
