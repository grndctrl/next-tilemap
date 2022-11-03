import { Vector3 } from 'three';

const blocksInChunk = new Vector3(12, 12, 12);
const blockSize = new Vector3(10, 5, 10);
const chunkSize = blocksInChunk.clone().multiply(blockSize);
const totalBlocksInChunk = blocksInChunk.x * blocksInChunk.y * blocksInChunk.z;

export { blocksInChunk, blockSize, chunkSize, totalBlocksInChunk };
