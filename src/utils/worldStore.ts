import {
  calcBlockIndexForPosition,
  calcBlockPositionForIndex,
  calcChunkArrayPositionForPosition,
  calcChunkIndexForArrayPosition,
  calcChunkPositionForWorldPosition,
  calcChunkWorldPositionForIndex,
  calcWorldIndexFromWorldPosition,
} from './chunkUtils';
import { useCallback } from 'react';
import { Vector3 } from 'three';
import create from 'zustand/vanilla';
import createHook from 'zustand';
import { BlockType, calcNeighboursForWorldPosition, getVerticesForTableIndex } from './blockUtils';
import createStore, { Schema, Store } from './typedArrayStore';
import worldJSON from '../../public/world.json';
import { isEqual } from 'lodash';
import { calcTableIndicesFromHeightmap, generateHeightmap, isWorldPositionWithinBounds } from './worldUtils';
import { blockSize, blocksInChunk, totalBlocksInChunk, chunkSize } from './constants';

//

const localPositionSchema: Schema = {
  x: 'Float32',
  y: 'Float32',
  z: 'Float32',
};

const worldPositionSchema: Schema = {
  x: 'Float32',
  y: 'Float32',
  z: 'Float32',
};

const verticesSchema: Schema = {
  '0': 'Uint8',
  '1': 'Uint8',
  '2': 'Uint8',
  '3': 'Uint8',
  '4': 'Uint8',
  '5': 'Uint8',
  '6': 'Uint8',
  '7': 'Uint8',
  '8': 'Uint8',
  '9': 'Uint8',
  '10': 'Uint8',
  '11': 'Uint8',
  '12': 'Uint8',
  '13': 'Uint8',
};

const neighboursSchema: Schema = {
  left: 'Int32',
  right: 'Int32',
  back: 'Int32',
  front: 'Int32',
  bottom: 'Int32',
  top: 'Int32',
};

//

interface Measurements {
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

//

class WorldStore {
  private localPosition: Store;
  private worldPosition: Store;
  private vertices: Store;
  private neighbours: Store;
  private measurements: Measurements;

  constructor(measurements: Measurements) {
    this.measurements = measurements;
    this.localPosition = {};
    this.worldPosition = {};
    this.vertices = {};
    this.neighbours = {};
  }

  public init(measurements: Measurements) {
    this.measurements = measurements;
    this.localPosition = createStore(localPositionSchema, this.measurements.totalBlocksInWorld);
    this.worldPosition = createStore(worldPositionSchema, this.measurements.totalBlocksInWorld);
    this.vertices = createStore(verticesSchema, this.measurements.totalBlocksInWorld);
    this.neighbours = createStore(neighboursSchema, this.measurements.totalBlocksInWorld);
  }

  //

  private isBlockActive(id: number) {
    return this.getVertices(id).findIndex((value) => value === true) > -1;
  }

  private getLocalPosition(id: number) {
    return new Vector3(this.localPosition.x[id], this.localPosition.y[id], this.localPosition.z[id]);
  }

  private getWorldPosition(id: number) {
    return new Vector3(this.worldPosition.x[id], this.worldPosition.y[id], this.worldPosition.z[id]);
  }

  private getNeighbours(id: number) {
    return [
      this.neighbours.left[id],
      this.neighbours.right[id],
      this.neighbours.back[id],
      this.neighbours.front[id],
      this.neighbours.bottom[id],
      this.neighbours.top[id],
    ];
  }

  private getVertices(id: number) {
    const vertices = [];

    for (let i = 0; i < 14; i++) {
      vertices.push(this.vertices[i][id] === 1);
    }

    return vertices;
  }

  private getBlockId(worldPosition: Vector3): number {
    const tempVector = new Vector3();

    for (let i = 0; i < this.measurements.totalBlocksInWorld; i++) {
      tempVector.set(this.worldPosition.x[i], this.worldPosition.y[i], this.worldPosition.z[i]);

      if (tempVector.equals(worldPosition)) {
        return i;
      }
    }

    return -1;
  }

  public getBlock(query: number | Vector3) {
    let id = -1;

    if (typeof query !== 'number') {
      id = this.getBlockId(query);
    } else {
      id = query;
    }

    if (id >= 0 && id < this.measurements.totalBlocksInWorld) {
      return {
        id: id,
        index: id % this.measurements.totalBlocksInChunk,
        parentChunk: Math.floor(id / this.measurements.totalBlocksInChunk),
        isActive: this.isBlockActive(id),
        localPosition: this.getLocalPosition(id),
        worldPosition: this.getWorldPosition(id),
        neighbours: this.getNeighbours(id),
        vertices: this.getVertices(id),
      };
    }

    return null;
  }

  //

  private setLocalPosition(id: number, _localPosition: Vector3) {
    this.localPosition.x[id] = _localPosition.x;
    this.localPosition.y[id] = _localPosition.y;
    this.localPosition.z[id] = _localPosition.z;
  }

  private setWorldPosition(id: number, worldPosition: Vector3) {
    this.worldPosition.x[id] = worldPosition.x;
    this.worldPosition.y[id] = worldPosition.y;
    this.worldPosition.z[id] = worldPosition.z;
  }

  private setNeighbours(id: number, neighbours: number[]) {
    this.neighbours.left[id] = neighbours[0];
    this.neighbours.right[id] = neighbours[1];
    this.neighbours.back[id] = neighbours[2];
    this.neighbours.front[id] = neighbours[3];
    this.neighbours.bottom[id] = neighbours[4];
    this.neighbours.top[id] = neighbours[5];
  }

  private setVertices(id: number, vertices: boolean[]) {
    for (let i = 0; i < 14; i++) {
      this.vertices[i][id] = vertices[i] ? 1 : 0;
    }
  }

  public setBlock({
    id,
    localPosition,
    worldPosition,
    neighbours,
    vertices,
  }: {
    id: number;
    localPosition: Vector3;
    worldPosition: Vector3;
    neighbours: number[];
    vertices: boolean[];
  }) {
    this.setLocalPosition(id, localPosition);
    this.setWorldPosition(id, worldPosition);
    this.setNeighbours(id, neighbours);
    this.setVertices(id, vertices);
  }

  //

  // public exportJSON() {
  //   const totalBlocksInChunk = this.totalBlocksInChunk;
  //   const totalChunksInWorld = this.totalChunksInWorld;
  //   const totalBlocksInWorld = this.totalBlocksInWorld;

  //   const localPosition = this.localPosition;
  //   const worldPosition = this.worldPosition;
  //   const vertices = this.vertices;
  //   const neighbours = this.neighbours;
  //   const chunks = this.chunks;

  //   const json = JSON.stringify({
  //     totalBlocksInChunk,
  //     totalChunksInWorld,
  //     totalBlocksInWorld,
  //     localPosition,
  //     worldPosition,
  //     vertices,
  //     neighbours,
  //     chunks,
  //   });

  //   return json;
  // }
}

//

class Chunk {
  private store: WorldStore;
  private measurements: Measurements;

  index: number;
  origin: Vector3;
  blocks: number[];

  constructor(index: number, origin: Vector3, measurements: Measurements, store: WorldStore) {
    this.index = index;
    this.measurements = measurements;
    this.origin = origin;
    this.store = store;

    this.blocks = Array.from({ length: this.measurements.totalBlocksInChunk }).map((_, index) => {
      const id = this.index * this.measurements.totalBlocksInChunk + index;
      return id;
    });
  }

  public init() {
    for (let i = 0; i < this.blocks.length; i++) {
      const id = this.blocks[i];

      const localPosition = calcBlockPositionForIndex(i);

      const worldPosition = localPosition.clone().add(this.origin);

      const vertices = Array.from({ length: 14 }).map(() => this.index < this.measurements.totalChunksInWorld / 2);

      const neighbours = calcNeighboursForWorldPosition(worldPosition, this.measurements.worldSize).map(
        (neighbourPosition) => {
          if (isWorldPositionWithinBounds(neighbourPosition, this.measurements.worldSize)) {
            const chunkOrigin = calcChunkPositionForWorldPosition(neighbourPosition, this.measurements.chunksInWorld);
            const chunkArrayPosition = calcChunkArrayPositionForPosition(chunkOrigin, this.measurements.chunksInWorld);
            const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
            const chunkIndex = calcChunkIndexForArrayPosition(chunkArrayPosition, this.measurements.chunksInWorld);

            const neighbourIndex = totalBlocksInChunk * chunkIndex + calcBlockIndexForPosition(blockPosition);

            return neighbourIndex;
          }

          return -1;
        }
      );

      this.store.setBlock({
        id,
        localPosition,
        worldPosition,
        vertices,
        neighbours,
      });
    }
  }

  // public initWithData(
  //   data: any,
  //   storeLocalPosition: Store,
  //   storeWorldPosition: Store,
  //   storeVertices: Store,
  //   storeNeighbours: Store
  // ) {
  //   for (let i = 0; i < this.blocks.length; i++) {
  //     const id = this.blocks[i];

  //     storeLocalPosition.x[id] = data.localPosition.x[id];
  //     storeLocalPosition.y[id] = data.localPosition.y[id];
  //     storeLocalPosition.z[id] = data.localPosition.z[id];

  //     storeWorldPosition.x[id] = data.worldPosition.x[id];
  //     storeWorldPosition.y[id] = data.worldPosition.y[id];
  //     storeWorldPosition.z[id] = data.worldPosition.z[id];

  //     for (let j = 0; j < 14; j++) {
  //       storeVertices[j][id] = data.vertices[j][id];
  //     }

  //     storeNeighbours.left[id] = data.neighbours.left[id];
  //     storeNeighbours.right[id] = data.neighbours.right[id];
  //     storeNeighbours.back[id] = data.neighbours.back[id];
  //     storeNeighbours.front[id] = data.neighbours.front[id];
  //     storeNeighbours.bottom[id] = data.neighbours.bottom[id];
  //     storeNeighbours.top[id] = data.neighbours.top[id];
  //   }
  // }

  // public initFromTableIndices(
  //   tableIndices: number[],
  //   storeLocalPosition: Store,
  //   storeWorldPosition: Store,
  //   storeVertices: Store,
  //   storeNeighbours: Store
  // ) {
  //   for (let i = 0; i < this.blocks.length; i++) {
  //     const id = this.blocks[i];
  //     const localPosition = calcBlockPositionForIndex(i);
  //     const worldPosition = localPosition.clone().add(this.origin);

  //     storeLocalPosition.x[id] = localPosition.x;
  //     storeLocalPosition.y[id] = localPosition.y;
  //     storeLocalPosition.z[id] = localPosition.z;

  //     storeWorldPosition.x[id] = worldPosition.x;
  //     storeWorldPosition.y[id] = worldPosition.y;
  //     storeWorldPosition.z[id] = worldPosition.z;

  //     const worldIndex = calcWorldIndexFromWorldPosition(worldPosition);
  //     const vertices = getVerticesForTableIndex(tableIndices[worldIndex]);
  //     for (let j = 0; j < 14; j++) {
  //       storeVertices[j][id] = Number(vertices[j]);
  //     }

  //     const neighbours = calcNeighboursForWorldPosition(worldPosition).map((neighbourPosition) => {
  //       if (isWorldPositionWithinBounds(neighbourPosition)) {
  //         const chunkOrigin = calcChunkPositionForWorldPosition(neighbourPosition);
  //         const chunkArrayPosition = calcChunkArrayPositionForPosition(chunkOrigin);
  //         const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
  //         const chunkIndex = calcChunkIndexForArrayPosition(chunkArrayPosition);

  //         const neighbourIndex = totalBlocksInChunk * chunkIndex + calcBlockIndexForPosition(blockPosition);

  //         return neighbourIndex;
  //       }

  //       return -1;
  //     });

  //     storeNeighbours.left[id] = neighbours[0];
  //     storeNeighbours.right[id] = neighbours[1];
  //     storeNeighbours.back[id] = neighbours[2];
  //     storeNeighbours.front[id] = neighbours[3];
  //     storeNeighbours.bottom[id] = neighbours[4];
  //     storeNeighbours.top[id] = neighbours[5];
  //   }
  // }
}

//

class World {
  private store: WorldStore;
  public measurements: Measurements;
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

//

interface ChunkState {
  chunkRenderKeys: number[];
  resetChunkRenderKeys: (totalChunksInWorld: number) => void;
  updateRenderKey: (index: number) => void;
}

const chunkState = create<ChunkState>()((set, get) => ({
  chunkRenderKeys: [],
  resetChunkRenderKeys: (totalChunksInWorld: number) => {
    const chunkRenderKeys = Array.from({ length: totalChunksInWorld }).map(() => 0);
    set(() => ({ chunkRenderKeys }));
  },
  updateRenderKey: (index) => {
    const chunkRenderKeys = get().chunkRenderKeys.slice();
    chunkRenderKeys[index]++;
    set(() => ({ chunkRenderKeys }));
  },
}));

const useChunkState = createHook(chunkState);

//

const world = new World();

const createWorld = () => {
  const { resetChunkRenderKeys } = chunkState.getState();
  world.init(new Vector3(2, 2, 2));
  world.generate();
  resetChunkRenderKeys(world.measurements.totalChunksInWorld);
};

createWorld();

//

const useWorldStore = () => {
  const { chunks, measurements } = world;

  const { totalChunksInWorld, totalBlocksInChunk } = measurements;
  const { chunkRenderKeys, updateRenderKey } = useChunkState();

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

export { useWorldStore };
