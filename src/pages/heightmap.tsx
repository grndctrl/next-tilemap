import alea from 'alea';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { createNoise2D } from 'simplex-noise';
import { Vector3 } from 'three';
import { useWorldStore } from '../utils/worldStore';
import { generateHeightmap } from '../utils/worldUtils';

const prng = alea('seed');
const noise2D = createNoise2D(prng);

type TileProps = {
  x: number;
  y: number;
  height: number;
  tableIndex: number;
  blocksInWorld: Vector3;
};

const Tile = ({ x, y, height, tableIndex, blocksInWorld }: TileProps) => {
  const [hover, setHover] = useState(false);

  const w = 32;
  const h = 32;
  const translate = `translate3d(${x * w}px, ${y * h}px, 0)`;
  const styles = {
    width: `${w}px`,
    height: `${h}px`,
    transform: translate,
  };

  const handlePointerEnter = () => {
    setHover(true);
  };
  const handlePointerLeave = () => {
    setHover(false);
  };

  const hoverStyles = useSpring({ opacity: hover ? 1 : 0 });

  return (
    <>
      <div
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`absolute  marker:font-mono text-xs border border-transparent z-0`}
        style={styles}
      >
        <div className="absolute inset-0 z-10 flex items-center justify-center p-2 text-yellow-300 ">{height}</div>
        <div className="absolute inset-0 z-0 p-2 bg-violet-600" style={{ opacity: height / blocksInWorld.y }}></div>
      </div>
      <animated.div
        className="fixed z-20 px-4 py-2 rounded-full opacity-0 pointer-events-none top-10 left-10 bg-slate-300 text-slate-800"
        style={hoverStyles}
      >
        {tableIndex} - {x}:{y}
      </animated.div>
    </>
  );
};

const Page: NextPage = () => {
  const { measurements } = useWorldStore();
  const [tiles, setTiles] = useState<{ height: number; tableIndex: number }[]>([]);

  const { blocksInWorld } = measurements;
  useEffect(() => {
    const tiles = generateHeightmap();

    setTiles(tiles);
  }, []);

  return (
    <div className="fixed w-full h-screen px-10 pt-32 bg-slate-900">
      {tiles.map(({ height, tableIndex }, index) => {
        const x = index % blocksInWorld.x;
        const y = Math.floor(index / blocksInWorld.x);

        return <Tile key={`tile-${y}-${x}`} x={x} y={y} height={height} tableIndex={tableIndex} />;
      })}
    </div>
  );
};

export default Page;
