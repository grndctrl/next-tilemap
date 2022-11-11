import { Vector3 } from 'three';
import { calcTableIndex, getVerticesForTableIndex } from 'utils/blockUtils';
import { calcChunkWorldPositionForIndex } from 'utils/chunkUtils';

import { blocksInChunk, blockSize, chunkSize, totalBlocksInChunk } from 'utils/constants';
import {
  calcTableIndexForNeighboursFirstIteration,
  calcTableIndexForNeighboursSecondIteration,
} from 'utils/worldUtils';
import Chunk from './Chunk';
import { useWorld, useWorldGenerator } from './hooks';
import WorldStore from './WorldStore';

export interface GetBlock {
  (query: number | Vector3): {
    id: number;
    index: number;
    parentChunk: number;
    isActive: boolean;
    localPosition: Vector3;
    worldPosition: Vector3;
    neighbours: number[];
    vertices: boolean[];
  } | null;
}

export interface WorldMeasurements {
  blocksInChunk: Vector3;
  blocksInWorld: Vector3;
  chunksInWorld: Vector3;
  blockSize: Vector3;
  chunkSize: Vector3;
  worldSize: Vector3;
  totalBlocksInChunk: number;
  totalBlocksInWorld: number;
  totalChunksInWorld: number;
}

class World {
  private store: WorldStore;
  public measurements: WorldMeasurements;
  public chunks: Chunk[];

  constructor() {
    this.measurements = {
      blocksInChunk: new Vector3(),
      blocksInWorld: new Vector3(),
      chunksInWorld: new Vector3(),
      blockSize: new Vector3(),
      chunkSize: new Vector3(),
      worldSize: new Vector3(),
      totalBlocksInChunk: 0,
      totalBlocksInWorld: 0,
      totalChunksInWorld: 0,
    };
    this.store = new WorldStore(this.measurements);
    this.chunks = [];
  }

  init(chunksInWorld: Vector3) {
    const blocksInWorld = chunksInWorld.clone().multiply(blocksInChunk);
    const worldSize = blocksInWorld.clone().multiply(blockSize);

    this.measurements = {
      blocksInChunk: blocksInChunk,
      blocksInWorld: blocksInWorld,
      chunksInWorld: chunksInWorld,
      blockSize: blockSize,
      chunkSize: chunkSize,
      worldSize: worldSize,
      totalBlocksInChunk: totalBlocksInChunk,
      totalBlocksInWorld: blocksInWorld.x * blocksInWorld.y * blocksInWorld.z,
      totalChunksInWorld: chunksInWorld.x * chunksInWorld.y * chunksInWorld.z,
    };

    this.store.init(this.measurements);

    this.chunks = [];
  }

  //

  public generate() {
    const promises = Array.from({
      length: this.measurements.totalChunksInWorld,
    }).map((_, index) => {
      return this.generateChunk(index);
    });

    Promise.all(promises).then((chunks) => (this.chunks = chunks));
  }

  public generateChunk(index: number): Promise<Chunk> {
    return new Promise((resolve, reject) => {
      const origin = calcChunkWorldPositionForIndex(index, this.measurements.chunksInWorld);

      const chunk = new Chunk(index, origin, this.measurements, this.store);
      chunk.init();

      resolve(chunk);
    });
  }

  public generateChunkFromTableIndices(index: number, tableIndices: number[]) {
    return new Promise<Chunk>((resolve, reject) => {
      const origin = calcChunkWorldPositionForIndex(index, this.measurements.chunksInWorld);

      const chunk = new Chunk(index, origin, this.measurements, this.store);
      chunk.initFromTableIndices(tableIndices);

      resolve(chunk);
    });
  }

  public modifyChunk(index: number, firstIteration: boolean = true) {
    return new Promise<string>((resolve, reject) => {
      if (index < 0 || index > this.chunks.length - 1) reject('chunk index does not exist');

      const chunk = this.chunks[index];

      for (let i = 0; i < chunk.blocks.length; i++) {
        const id = chunk.blocks[chunk.blocks.length - 1 - i];
        const block = this.getBlock(id);

        if (!block) continue;

        if (calcTableIndex(block.vertices) === 0) continue;

        const neighbours = block.neighbours.map((neighbourId) => {
          if (neighbourId > -1) {
            const neighbour = this.getBlock(neighbourId);

            if (neighbour) {
              return calcTableIndex(neighbour.vertices);
            }
          }

          return 16383;
        });

        let tableIndex = calcTableIndex(block.vertices);

        if (firstIteration) {
          if (neighbours[5] > 0) continue;
          tableIndex = calcTableIndexForNeighboursFirstIteration(neighbours);
        } else {
          if (neighbours[5] > 6798) continue;
          tableIndex = calcTableIndexForNeighboursSecondIteration(tableIndex, neighbours);
        }

        block.vertices = getVerticesForTableIndex(tableIndex);

        this.store.setBlock(block);
      }

      resolve('completed modification');
    });
  }

  //

  public getBlock(query: number | Vector3) {
    return this.store.getBlock(query);
  }

  public setBlock(block: {
    id: number;
    localPosition: Vector3;
    worldPosition: Vector3;
    neighbours: number[];
    vertices: boolean[];
  }) {
    return this.store.setBlock(block);
  }

  //

  public exportJSON() {
    return this.store.exportJSON();
  }
}

const world = new World();

// const createWorld = () => {
//   const { resetChunkRenderKeys } = chunkStore.getState();
//   world.init(new Vector3(2, 2, 2));
//   world.generate();
//   resetChunkRenderKeys(world.measurements.totalChunksInWorld);
// };

// createWorld();

//

export { useWorld, useWorldGenerator, world };
