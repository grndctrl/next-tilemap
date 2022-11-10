import { useEffect, useRef } from 'react';
import { Vector2, Vector3 } from 'three';
import { colors } from 'utils/tailwindDefaults';
import { config } from 'utils/colors';

type TileProps = {
  index: number;
  height: number;
  tableIndex: number;
  blocksInWorld: Vector3;
  parentSize: number;
};

type HeightmapProps = {
  blocksInWorld: Vector3;
  tiles: { height: number; tableIndex: number }[];
};

const Heightmap = ({ tiles, blocksInWorld }: HeightmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heightmapRef = useRef<HTMLDivElement | null>(null);
  const width = useRef<number>(0);

  useEffect(() => {
    if (!heightmapRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');

    if (!context) return;

    const { width } = heightmapRef.current.getBoundingClientRect();
    context.fillStyle = config.warning.active;
    context.fillRect(0, 0, blocksInWorld.x, blocksInWorld.z);

    tiles.forEach(({ height }, index) => {
      const x = index % blocksInWorld.x;
      const y = Math.floor(index / blocksInWorld.x);

      context.fillStyle = `rgba(120, 0, 0, ${height / blocksInWorld.y})`;
      context.fillRect(x, y, 1, 1);
    });
  }, [tiles]);

  return (
    <div ref={heightmapRef} className="relative w-full ui-element" style={{ color: config.warning.activeGlow }}>
      <canvas className="w-full crisp" ref={canvasRef} width={blocksInWorld.x} height={blocksInWorld.z} />
    </div>
  );
};

export default Heightmap;
