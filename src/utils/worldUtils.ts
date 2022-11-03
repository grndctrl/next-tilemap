import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { Vector2, Vector3 } from 'three';
import { calcBlockIndexForArrayPosition } from '../utils/chunkUtils';

const getMeasurements = () => {
  const chunksInWorld = new Vector3(4, 4, 4);
  const blocksInChunk = new Vector3(8, 8, 8);
  const blockSize = new Vector3(10, 5, 10);

  const blocksInWorld = chunksInWorld.clone().multiply(blocksInChunk);
  const chunkSize = blocksInChunk.clone().multiply(blockSize);
  const worldSize = blocksInWorld.clone().multiply(blockSize);
  const totalBlocksInChunk = blocksInChunk.x * blocksInChunk.y * blocksInChunk.z;
  const totalBlocksInWorld = blocksInWorld.x * blocksInWorld.y * blocksInWorld.z;
  const totalChunksInWorld = chunksInWorld.x * chunksInWorld.y * chunksInWorld.z;

  return {
    blocksInChunk,
    blocksInWorld,
    blockSize,
    chunksInWorld,
    chunkSize,
    totalBlocksInChunk,
    totalBlocksInWorld,
    totalChunksInWorld,
    worldSize,
  };
};

//

const isWorldPositionWithinBounds = (worldPosition: Vector3, worldSize: Vector3): boolean => {
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

// TODO: this return object makes no sense
const getNeighbours = (position: Vector2, heightmap: number[], blocksInWorld: Vector3): boolean[] => {
  const index = position.x + position.y * blocksInWorld.x;
  const height = heightmap[index];

  const positions = [
    position.clone().add(new Vector2(-1, 0)),
    position.clone().add(new Vector2(1, 0)),
    position.clone().add(new Vector2(0, -1)),
    position.clone().add(new Vector2(0, 1)),
  ];

  const neighbours = positions.map(({ x, y }) => {
    if (x < 0 || x > blocksInWorld.x - 1 || y < 0 || y > blocksInWorld.z - 1) {
      return true;
    }

    const neighbourIndex = x + y * blocksInWorld.x;
    const neighbourHeight = heightmap[neighbourIndex];

    if (neighbourHeight < height) {
      return false;
    }

    return true;
  });

  return neighbours;
};

const getTableIndex = (neighbours: boolean[]) => {
  // ramps
  if (!neighbours[0] && neighbours[1] && neighbours[2] && neighbours[3]) return 7855;

  if (!neighbours[0] && neighbours[1] && !neighbours[2] && !neighbours[3]) return 7855;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && neighbours[3]) return 7519;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && !neighbours[3]) return 7519;

  if (neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (!neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  if (!neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  // corners
  if (!neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 6798;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 6477;

  if (!neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5675;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5399;

  return 16383;
};

const modifyTableIndex = (tableIndex: number, neighbours: number[]) => {
  // corners
  if (tableIndex !== 16383) return tableIndex;

  if (neighbours[0] === 7119 || neighbours[0] === 6798) {
    if (neighbours[2] === 7855 || neighbours[2] === 6798) {
      return 16367;
    }
  }

  if (neighbours[1] === 7119 || neighbours[1] === 6477) {
    if (neighbours[2] === 7519 || neighbours[2] === 6477) {
      return 16351;
    }
  }

  if (neighbours[0] === 5951 || neighbours[0] === 5675) {
    if (neighbours[3] === 7855 || neighbours[3] === 5675) {
      return 16319;
    }
  }

  if (neighbours[1] === 5951 || neighbours[1] === 5399) {
    if (neighbours[3] === 7519 || neighbours[3] === 5399) {
      return 16255;
    }
  }

  return tableIndex;
};

const getNeighboursTableIndex = (position: Vector2, tableIndices: number[], blocksInWorld: Vector3) => {
  const index = position.x + position.y * blocksInWorld.x;

  const positions = [
    position.clone().add(new Vector2(-1, 0)),
    position.clone().add(new Vector2(1, 0)),
    position.clone().add(new Vector2(0, -1)),
    position.clone().add(new Vector2(0, 1)),
  ];

  const neighbours = positions.map(({ x, y }) => {
    if (x < 0 || x > blocksInWorld.x - 1 || y < 0 || y > blocksInWorld.z - 1) {
      return 0;
    }

    const neighbourIndex = x + y * blocksInWorld.x;
    return tableIndices[neighbourIndex];
  });

  return neighbours;
};

//

//

const generateHeightmap = (blocksInWorld: Vector3, seed: string = 'seed', resolution: number = 0.075) => {
  const heightmap = Array.from({ length: blocksInWorld.x * blocksInWorld.z }).map(() => 0);
  const tableIndices = Array.from({ length: blocksInWorld.x * blocksInWorld.z }).map(() => 0);
  const blocks = Array.from({ length: blocksInWorld.x * blocksInWorld.z }).map(() => ({ height: 0, tableIndex: 0 }));

  const prng = alea(seed);
  const noise2D = createNoise2D(prng);

  for (let y = 0; y < blocksInWorld.z; y++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const index = x + y * blocksInWorld.x;
      const noise = (noise2D(x * resolution, y * resolution) + 1.0) * 0.5;

      heightmap[index] = Math.floor(blocksInWorld.y * noise * 0.25 + Math.ceil(blocksInWorld.y * 0.125));
    }
  }

  // TODO: Do these iterations on chunk level.
  // // first iteration, find ramps and corners
  // const position = new Vector2();
  // for (let y = 0; y < blocksInWorld.z; y++) {
  //   for (let x = 0; x < blocksInWorld.x; x++) {
  //     const index = x + y * blocksInWorld.x;

  //     position.set(x, y);
  //     const neighbours = getNeighbours(position, heightmap);

  //     tableIndices[index] = getTableIndex(neighbours);
  //   }
  // }

  // // second iteration to smooth skipped corners
  // for (let y = 0; y < blocksInWorld.z; y++) {
  //   for (let x = 0; x < blocksInWorld.x; x++) {
  //     const index = x + y * blocksInWorld.x;

  //     position.set(x, y);
  //     const neighbours = getNeighboursTableIndex(position, tableIndices);
  //     if (x === 10 && y === 20) {
  //       console.log(tableIndices[index]);
  //     }
  //     tableIndices[index] = modifyTableIndex(tableIndices[index], neighbours);
  //     if (x === 10 && y === 20) {
  //       console.log(tableIndices[index]);
  //     }
  //   }
  // }

  for (let y = 0; y < blocksInWorld.z; y++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const index = x + y * blocksInWorld.x;

      blocks[index].height = heightmap[index];
      blocks[index].tableIndex = tableIndices[index];
    }
  }

  return blocks;
};

const calcTableIndicesFromHeightmap = (heightmap: { height: number; tableIndex: number }[], blocksInWorld: Vector3) => {
  const totalBlocksInWorld = blocksInWorld.x * blocksInWorld.y * blocksInWorld.z;
  const tableIndices = Array.from({ length: totalBlocksInWorld }).map(() => 0);

  for (let z = 0; z < blocksInWorld.z; z++) {
    for (let x = 0; x < blocksInWorld.x; x++) {
      const { height, tableIndex } = heightmap[x + z * blocksInWorld.x];

      for (let y = 0; y < height; y++) {
        const index = x + z * blocksInWorld.x + y * blocksInWorld.x * blocksInWorld.z;
        tableIndices[index] = 16383;
      }
    }
  }

  console.log('🚀 ~ file: worldUtils.ts ~ line 246 ~ tableIndices', tableIndices);
  return tableIndices;
};

const getTableIndexForNeighbours = (neighbours: boolean[]) => {
  // ramps
  if (!neighbours[0] && neighbours[1] && neighbours[2] && neighbours[3]) return 7855;

  if (!neighbours[0] && neighbours[1] && !neighbours[2] && !neighbours[3]) return 7855;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && neighbours[3]) return 7519;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && !neighbours[3]) return 7519;

  if (neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (!neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  if (!neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  // corners
  if (!neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 6798;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 6477;

  if (!neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5675;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5399;

  return 16383;
};

const calcTableIndexForNeighboursFirstIteration = (neighbours: number[]) => {
  // ramps
  if (!neighbours[0] && neighbours[1] && neighbours[2] && neighbours[3]) return 7855;

  if (!neighbours[0] && neighbours[1] && !neighbours[2] && !neighbours[3]) return 7855;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && neighbours[3]) return 7519;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && !neighbours[3]) return 7519;

  if (neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (!neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 7119;

  if (neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  if (!neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5951;

  // corners
  if (!neighbours[0] && neighbours[1] && !neighbours[2] && neighbours[3]) return 6798;

  if (neighbours[0] && !neighbours[1] && !neighbours[2] && neighbours[3]) return 6477;

  if (!neighbours[0] && neighbours[1] && neighbours[2] && !neighbours[3]) return 5675;

  if (neighbours[0] && !neighbours[1] && neighbours[2] && !neighbours[3]) return 5399;

  return 16383;
};

const calcTableIndexForNeighboursSecondIteration = (tableIndex: number, neighbours: number[]) => {
  // corners
  if (tableIndex !== 16383) return tableIndex;

  if (neighbours[0] === 7119 || neighbours[0] === 6798) {
    if (neighbours[2] === 7855 || neighbours[2] === 6798) {
      return 16367;
    }
  }

  if (neighbours[1] === 7119 || neighbours[1] === 6477) {
    if (neighbours[2] === 7519 || neighbours[2] === 6477) {
      return 16351;
    }
  }

  if (neighbours[0] === 5951 || neighbours[0] === 5675) {
    if (neighbours[3] === 7855 || neighbours[3] === 5675) {
      return 16319;
    }
  }

  if (neighbours[1] === 5951 || neighbours[1] === 5399) {
    if (neighbours[3] === 7519 || neighbours[3] === 5399) {
      return 16255;
    }
  }

  return tableIndex;
};

export {
  generateHeightmap,
  calcTableIndicesFromHeightmap,
  isWorldPositionWithinBounds,
  getTableIndexForNeighbours,
  calcTableIndexForNeighboursFirstIteration,
  calcTableIndexForNeighboursSecondIteration,
};
