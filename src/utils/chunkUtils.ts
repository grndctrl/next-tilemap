import { Vector3 } from "three";
import {
  blockSize,
  blocksInChunk,
  chunkSize,
  totalBlocksInChunk,
} from "./constants";

//

const calcChunkArrayPositionForIndex = (
  index: number,
  chunksInWorld: Vector3
): Vector3 => {
  const x = index % chunksInWorld.x;
  const y = Math.floor(index / (chunksInWorld.x * chunksInWorld.z));
  const z = Math.floor(index / chunksInWorld.x) % chunksInWorld.z;

  const arrayPosition = new Vector3(x, y, z);

  return arrayPosition;
};

//

const calcChunkWorldPositionForIndex = (
  index: number,
  chunksInWorld: Vector3
): Vector3 => {
  const arrayPosition = calcChunkArrayPositionForIndex(index, chunksInWorld);

  const x = (chunksInWorld.x - 1) * 0.5;
  const y = (chunksInWorld.y - 1) * 0.5;
  const z = (chunksInWorld.z - 1) * 0.5;
  const offset = new Vector3(x, y, z);

  const position = arrayPosition.sub(offset).multiply(chunkSize);
  return position;
};

//

const calcBlockArrayPositionForIndex = (index: number): Vector3 => {
  const x = index % blocksInChunk.x;
  const y = Math.floor(index / (blocksInChunk.x * blocksInChunk.z));
  const z = Math.floor(index / blocksInChunk.x) % blocksInChunk.z;

  const arrayPosition = new Vector3(x, y, z);

  return arrayPosition;
};

//

const calcBlockPositionForIndex = (index: number): Vector3 => {
  const arrayPosition = calcBlockArrayPositionForIndex(index);

  const x = (blocksInChunk.x - 1) * 0.5;
  const y = (blocksInChunk.y - 1) * 0.5;
  const z = (blocksInChunk.z - 1) * 0.5;
  const offset = new Vector3(x, y, z);

  const position = arrayPosition.clone().sub(offset).multiply(blockSize);

  return position;
};

//

const calcChunkPositionForWorldPosition = (
  position: Vector3,
  chunksInWorld: Vector3
): Vector3 => {
  const worldOffset = chunksInWorld.clone().divideScalar(2);
  const chunkPosition = position
    .clone()
    .divide(chunkSize)
    .add(worldOffset)
    .floor()
    .addScalar(0.5)
    .sub(worldOffset)
    .multiply(chunkSize);

  return chunkPosition;
};

//

const calcBlockArrayPositionForPosition = (position: Vector3): Vector3 => {
  const x = (blocksInChunk.x - 1) * 0.5;
  const y = (blocksInChunk.y - 1) * 0.5;
  const z = (blocksInChunk.z - 1) * 0.5;

  const offset = new Vector3(x, y, z);

  const arrayPosition = position.clone().divide(blockSize).add(offset);

  return arrayPosition;
};

//

const calcChunkArrayPositionForPosition = (
  position: Vector3,
  chunksInWorld: Vector3
): Vector3 => {
  const x = (chunksInWorld.x - 1) * 0.5;
  const y = (chunksInWorld.y - 1) * 0.5;
  const z = (chunksInWorld.z - 1) * 0.5;

  const offset = new Vector3(x, y, z);

  const arrayPosition = position.clone().divide(chunkSize).add(offset);

  return arrayPosition;
};

//

const calcBlockIndexForArrayPosition = (arrayPosition: Vector3) => {
  const x = arrayPosition.x;
  const y = arrayPosition.y * blocksInChunk.x * blocksInChunk.z;
  const z = arrayPosition.z * blocksInChunk.x;

  const index = x + y + z;

  return index;
};

//

const calcChunkIndexForArrayPosition = (
  arrayPosition: Vector3,
  chunksInWorld: Vector3
) => {
  const x = arrayPosition.x;
  const y = arrayPosition.y * chunksInWorld.x * chunksInWorld.z;
  const z = arrayPosition.z * chunksInWorld.x;

  const index = x + y + z;

  return index;
};

//

// const calcBlockWorldPositionForIndexAndParentChunk = (
//   index: number,
//   parentChunk: number,
//   chunks: ChunkType[]
// ): Vector3 => {
//   const chunk = chunks[parentChunk];

//   return chunk.worldPosition.clone().add(chunk.blocks[index].position);
// };

//

const calcBlockIndexForPosition = (position: Vector3) => {
  const arrayPosition = calcBlockArrayPositionForPosition(position);
  const index = calcBlockIndexForArrayPosition(arrayPosition);

  return index;
};

//

const calcWorldPositionFromArrayPosition = (
  position: Vector3,
  blocksInWorld: Vector3
) => {
  const x = (blocksInWorld.x - 1) * 0.5;
  const y = (blocksInWorld.y - 1) * 0.5;
  const z = (blocksInWorld.z - 1) * 0.5;

  const offset = new Vector3(x, y, z);

  const worldPosition = position.clone().sub(offset).multiply(blockSize);

  return worldPosition;
};

//

const calcArrayPositionFromWorldPosition = (
  position: Vector3,
  blocksInWorld: Vector3
) => {
  const x = (blocksInWorld.x - 1) * 0.5;
  const y = (blocksInWorld.y - 1) * 0.5;
  const z = (blocksInWorld.z - 1) * 0.5;

  const offset = new Vector3(x, y, z);

  const arrayPosition = position.clone().divide(blockSize).add(offset);

  return arrayPosition;
};

const calcWorldIndexFromWorldPosition = (
  position: Vector3,
  blocksInWorld: Vector3
) => {
  const arrayPosition = calcArrayPositionFromWorldPosition(
    position,
    blocksInWorld
  );

  const x = arrayPosition.x;
  const y = arrayPosition.y * blocksInWorld.x * blocksInWorld.z;
  const z = arrayPosition.z * blocksInWorld.x;

  const index = x + y + z;

  return index;
};

//

export {
  calcChunkWorldPositionForIndex,
  calcBlockPositionForIndex,
  calcChunkPositionForWorldPosition,
  calcChunkIndexForArrayPosition,
  calcBlockIndexForArrayPosition,
  calcChunkArrayPositionForPosition,
  // calcBlockWorldPositionForIndexAndParentChunk,
  calcBlockIndexForPosition,
  calcWorldIndexFromWorldPosition,
  calcArrayPositionFromWorldPosition,
  calcWorldPositionFromArrayPosition,
};
