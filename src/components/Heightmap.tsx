import { useEffect, useRef } from 'react';
import { Vector2, Vector3 } from 'three';

type TileProps = {
  index: number;
  height: number;
  tableIndex: number;
  blocksInWorld: Vector3;
  parentSize: number;
};

const Tile = ({ index, height, tableIndex, blocksInWorld, parentSize }: TileProps) => {
  const x = index % blocksInWorld.x;
  const y = Math.floor(index / blocksInWorld.x);
  const w = parentSize / blocksInWorld.x;
  const h = parentSize / blocksInWorld.z;
  const translate = `translate3d(${x * w}px, ${y * h}px, 0)`;
  const styles = {
    width: `${w}px`,
    height: `${h}px`,
    transform: translate,
    opacity: height / (blocksInWorld.y * 0.5),
  };

  return <div className="absolute top-0 left-0 z-0 bg-violet-300 " style={styles}></div>;
};

type HeightmapProps = {
  blocksInWorld: Vector3;
  tiles: { height: number; tableIndex: number }[];
};

const Heightmap = ({ tiles, blocksInWorld }: HeightmapProps) => {
  const heightmapRef = useRef<HTMLDivElement | null>(null);
  const width = useRef<number>(0);

  useEffect(() => {
    if (!heightmapRef.current) return;

    width.current = heightmapRef.current.getBoundingClientRect().width;
  }, []);

  return (
    <div ref={heightmapRef} className="relative w-full bg-violet-900 pt-[100%]">
      {tiles.map(({ height, tableIndex }, index) => {
        return (
          <Tile
            key={`tile-${index}`}
            index={index}
            height={height}
            parentSize={width.current}
            tableIndex={tableIndex}
            blocksInWorld={blocksInWorld}
          />
        );
      })}
    </div>
  );
};

export default Heightmap;
