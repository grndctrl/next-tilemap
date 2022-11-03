import type { NextPage } from 'next';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { useWorldGenerator } from 'core/World';
import { Vector3 } from 'three';
import { blocksInChunk } from 'utils/constants';
import { generateHeightmap } from 'utils/worldUtils';
import Heightmap from 'components/Heightmap';
import InputRange from 'components/UserInterface/InputRange';
import Button from 'components/UserInterface/Button';
import World from 'components/World';
import InputText from 'components/UserInterface/InputText';
import Progress from 'components/UserInterface/Progress';
import { WorldGeneratorState } from 'core/World/hooks';
import useMeasure from 'react-use-measure';
import { useSpring, animated } from '@react-spring/web';

const Home: NextPage = () => {
  const { state, init, progress } = useWorldGenerator();

  const [seed, setSeed] = useState<string>(Math.random().toString().slice(2, 10));
  const [size, setSize] = useState<number>(1);
  const [resolution, setResolution] = useState<number>(0.025);

  const [heightmap, setHeightmap] = useState<{ height: number; tableIndex: number }[]>([]);

  const chunksInWorld = useRef<Vector3>(new Vector3(1, 1, 1));
  const blocksInWorld = useRef<Vector3>(blocksInChunk.clone());

  useEffect(() => {
    chunksInWorld.current.set(size, size, size);
    blocksInWorld.current = chunksInWorld.current.clone().multiply(blocksInChunk);

    setHeightmap(generateHeightmap(blocksInWorld.current, seed, resolution));
  }, [size, seed, resolution]);

  // useEffect(() => {
  //   if (wrapperHeight > 0) {
  //     console.log('🚀 ~ file: index.tsx ~ line 43 ~ wrapperHeight', wrapperHeight);
  //     apiWrapperStyles.start({ to: { height: 200 } });
  //   }
  // }, [wrapperHeight]);

  const handleSeedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeed(event.target.value);
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value));
  };

  const handleResolutionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setResolution(parseFloat(event.target.value));
  };

  const handleRandomizeClick = () => {
    setSeed(Math.random().toString().slice(2, 10));
  };

  const handleClick = () => {
    const measurements = {
      chunksInWorld: chunksInWorld.current,
      blocksInWorld: blocksInWorld.current,
    };
    init(heightmap, measurements);
    console.log(state);
  };

  return (
    <div className="fixed flex flex-col items-center justify-center w-full h-screen bg-slate-900">
      {state !== WorldGeneratorState.FINISHED && (
        <animated.div className="flex flex-col  font-mono text-sm border-2 w-[400px] lg:text-lg border-slate-200 bg-slate-900">
          <div className="w-full p-8">
            {state === WorldGeneratorState.WAITING && (
              <>
                <div className="relative mb-4">
                  <Heightmap tiles={heightmap} blocksInWorld={blocksInWorld.current} />
                </div>
                <div className="flex my-4">
                  {<InputText value={seed} onChange={handleSeedChange} />}

                  <Button onClick={handleRandomizeClick} label="randomize" />
                </div>
                <div className="relative my-4">
                  <InputRange value={size} min={1} max={4} step={1} onChange={handleSizeChange} />
                </div>
                <div className="relative my-4">
                  <InputRange
                    value={resolution}
                    min={0.025}
                    max={0.075}
                    step={0.025}
                    onChange={handleResolutionChange}
                  />
                </div>
                <div className="relative mt-4">
                  <Button onClick={handleClick} label="generate world" />
                </div>
              </>
            )}
            {state !== WorldGeneratorState.WAITING && (
              <div className="flex w-full">
                <Progress value={progress.current} />
              </div>
            )}
          </div>
        </animated.div>
      )}
      {state === WorldGeneratorState.FINISHED && <Scene />}
    </div>
  );
};

export default Home;
