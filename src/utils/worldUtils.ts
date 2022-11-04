import alea from "alea";
import { createNoise2D } from "simplex-noise";
import { Vector3 } from "three";

//

const isWorldPositionWithinBounds = (
  worldPosition: Vector3,
  worldSize: Vector3
): boolean => {
  const minWorld = worldSize.clone().multiplyScalar(-0.5);
  const maxWorld = worldSize.clone().multiplyScalar(0.5);

  if (worldPosition.x < minWorld.x || worldPosition.x > maxWorld.x) {
    return false;
  }
  if (worldPosition.y < minWorld.y || worldPosition.y > maxWorld.y) {
    return false;
  }
  if (worldPosition.z < minWorld.z || worldPosition.z > maxWorld.z) {
    return false;
  }

  return true;
};

//

const generateHeightmap = (
  blocksInWorld: Vector3,
  seed: string = "seed",
  resolution: number = 0.075
) => {
  const heightmap = Array.from({
    length: blocksInWorld.x * blocksInWorld.z,
  }).map(() => 0);
  const tableIndices = Array.from({
    length: blocksInWorld.x * blocksInWorld.z,
  }).map(() => 0);
  const blocks = Array.from({ length: blocksInWorld.x * blocksInWorld.z }).map(
    () => ({ height: 0, tableIndex: 0 })
  );

  const prng = alea(seed);
  const noise2D = createNoise2D(prng);

  for (let y = 0; y < blocksInWorld.z; y++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const index = x + y * blocksInWorld.x;
      const noise = (noise2D(x * resolution, y * resolution) + 1.0) * 0.5;

      heightmap[index] = Math.floor(
        blocksInWorld.y * noise * 0.25 + Math.ceil(blocksInWorld.y * 0.125)
      );
    }
  }

  for (let y = 0; y < blocksInWorld.z; y++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const index = x + y * blocksInWorld.x;

      blocks[index].height = heightmap[index];
      blocks[index].tableIndex = tableIndices[index];
    }
  }

  return blocks;
};

//

const convert2DHeightmapTo3DTableIndices = (
  heightmap: { height: number; tableIndex: number }[],
  blocksInWorld: Vector3
) => {
  const totalBlocksInWorld =
    blocksInWorld.x * blocksInWorld.y * blocksInWorld.z;
  const tableIndices = Array.from({ length: totalBlocksInWorld }).map(() => 0);

  for (let z = 0; z < blocksInWorld.z; z++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const { height, tableIndex } = heightmap[x + z * blocksInWorld.x];

      for (let y = 0; y < height; y++) {
        const index =
          x + z * blocksInWorld.x + y * blocksInWorld.x * blocksInWorld.z;
        tableIndices[index] = 16383;
      }
    }
  }

  console.log(
    "🚀 ~ file: worldUtils.ts ~ line 246 ~ tableIndices",
    tableIndices
  );
  return tableIndices;
};

//

const calcTableIndexForNeighboursFirstIteration = (neighbours: number[]) => {
  // ramps
  if (!neighbours[0] && neighbours[1] && neighbours[2] && neighbours[3])
    return 7855;

  if (!neighbours[0] && neighbours[1] && !neighbours[2] && !neighbours[3])
    return 7855;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && neighbours[3])
    return 7519;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && !neighbours[3])
    return 7519;

  if (neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3])
    return 7119;

  if (!neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3])
    return 7119;

  if (neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3])
    return 5951;

  if (!neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3])
    return 5951;

  // corners
  if (!neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3])
    return 6798;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3])
    return 6477;

  if (!neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3])
    return 5675;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3])
    return 5399;

  return 16383;
};

const calcTableIndexForNeighboursSecondIteration = (
  tableIndex: number,
  neighbours: number[]
) => {
  // corners
  if (tableIndex !== 16383) return tableIndex;

  if (neighbours[0] === 7119 || neighbours[0] === 6798 || neighbours[0] === 0) {
    if (
      neighbours[2] === 7855 ||
      neighbours[2] === 6798 ||
      neighbours[2] === 0
    ) {
      return 16367;
    }
  }

  if (neighbours[1] === 7119 || neighbours[1] === 6477 || neighbours[1] === 0) {
    if (
      neighbours[2] === 7519 ||
      neighbours[2] === 6477 ||
      neighbours[2] === 0
    ) {
      return 16351;
    }
  }

  if (neighbours[0] === 5951 || neighbours[0] === 5675 || neighbours[0] === 0) {
    if (
      neighbours[3] === 7855 ||
      neighbours[3] === 5675 ||
      neighbours[3] === 0
    ) {
      return 16319;
    }
  }

  if (neighbours[1] === 5951 || neighbours[1] === 5399 || neighbours[1] === 0) {
    if (
      neighbours[3] === 7519 ||
      neighbours[3] === 5399 ||
      neighbours[3] === 0
    ) {
      return 16255;
    }
  }

  return tableIndex;
};

export {
  generateHeightmap,
  isWorldPositionWithinBounds,
  convert2DHeightmapTo3DTableIndices,
  calcTableIndexForNeighboursFirstIteration,
  calcTableIndexForNeighboursSecondIteration,
};
