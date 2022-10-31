import {
  calcBlockIndexForPosition,
  calcBlockPositionForIndex,
  calcChunkArrayPositionForPosition,
  calcChunkIndexForArrayPosition,
  calcChunkPositionForWorldPosition,
  calcChunkWorldPositionForIndex,
  calcWorldIndexFromWorldPosition,
} from 'utils/chunkUtils';
import { useCallback } from 'react';
import { Vector3 } from 'three';
import create from 'zustand/vanilla';
import createHook from 'zustand';
import { BlockType, calcNeighboursForWorldPosition, getVerticesForTableIndex } from 'utils/blockUtils';
import createStore, { Schema, Store } from 'utils/typedArrayStore';

import { isEqual } from 'lodash';
import { calcTableIndicesFromHeightmap, generateHeightmap, isWorldPositionWithinBounds } from 'utils/worldUtils';
import { blockSize, blocksInChunk, totalBlocksInChunk, chunkSize } from 'utils/constants';
import WorldStore from './WorldStore';
import Chunk, { useChunkStore, chunkStore } from './Chunk';

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
    this.chunks = Array.from({ length: this.measurements.totalChunksInWorld }).map((_, index) => {
      const origin = calcChunkWorldPositionForIndex(index, this.measurements.chunksInWorld);

      const chunk = new Chunk(index, origin, this.measurements, this.store);
      chunk.init();

      return chunk;
    });

    console.log('store', this.store);
  }

  // public generateFromJSON(data: any) {
  //   if (
  //     this.totalBlocksInChunk !== data.totalBlocksInChunk ||
  //     this.totalChunksInWorld !== data.totalChunksInWorld ||
  //     this.totalBlocksInWorld !== data.totalBlocksInWorld
  //   ) {
  //     return console.error('world sizes are different');
  //   }

  //   this.chunks = Array.from({ length: this.totalChunksInWorld }).map((_, index) => {
  //     const origin = calcChunkWorldPositionForIndex(index);

  //     const chunk = new Chunk(index, origin, this.totalBlocksInChunk);
  //     chunk.initWithData(data, this.localPosition, this.worldPosition, this.vertices, this.neighbours);

  //     return chunk;
  //   });
  // }

  // public generateFromHeightmap(heightmap: { height: number; tableIndex: number }[]) {
  //   const tableIndices = calcTableIndicesFromHeightmap(heightmap);

  //   this.chunks = Array.from({ length: this.totalChunksInWorld }).map((_, index) => {
  //     const origin = calcChunkWorldPositionForIndex(index);

  //     const chunk = new Chunk(index, origin, this.totalBlocksInChunk);
  //     chunk.initFromTableIndices(tableIndices, this.localPosition, this.worldPosition, this.vertices, this.neighbours);

  //     return chunk;
  //   });
  // }

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
}

const world = new World();

const createWorld = () => {
  const { resetChunkRenderKeys } = chunkStore.getState();
  world.init(new Vector3(2, 2, 2));
  world.generate();
  resetChunkRenderKeys(world.measurements.totalChunksInWorld);
};

createWorld();

//

const useWorld = () => {
  const { chunks, measurements } = world;

  const { totalChunksInWorld, totalBlocksInChunk } = measurements;
  const { chunkRenderKeys, updateRenderKey } = useChunkStore();

  const getBlock = useCallback((query: number | Vector3) => world.getBlock(query), []);

  const setBlock = useCallback(
    (block: BlockType) => {
      updateRenderKey(block.parentChunk);
      world.setBlock(block);
    },
    [updateRenderKey]
  );

  const setBlocks = useCallback(
    (blocks: BlockType[]) => {
      const uniqueChunks = new Set<number>([]);

      blocks.forEach((block) => {
        if (block.neighbours.length === 0) {
          console.error(block);
        } else {
          world.setBlock(block);
        }

        uniqueChunks.add(block.parentChunk);

        block.neighbours
          .map((neighbour) => world.getBlock(neighbour))
          .forEach((neighbour) => {
            if (neighbour) {
              uniqueChunks.add(neighbour.parentChunk);
            }
          });
      });

      uniqueChunks.forEach((chunk) => {
        updateRenderKey(chunk);
      });
    },
    [updateRenderKey]
  );

  return { chunks, getBlock, setBlock, setBlocks, chunkRenderKeys, updateRenderKey, measurements };
};

export { useWorld };
