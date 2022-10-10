import {
  calcBlockIndexForPosition,
  calcBlockPositionForIndex,
  calcChunkArrayPositionForPosition,
  calcChunkIndexForArrayPosition,
  calcChunkPositionForWorldPosition,
  calcChunkWorldPositionForIndex,
  getMeasurements,
} from './chunkUtils';
import { useCallback } from 'react';
import { Vector3 } from 'three';
import create from 'zustand';
import { BlockType, calcNeighboursForWorldPosition } from './blockUtils';
import createStore, { Schema, Store } from './typedArrayStore';

const { worldSize, totalBlocksInChunk, totalBlocksInWorld, totalChunksInWorld } = getMeasurements();

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

const isWorldPositionWithinBounds = (worldPosition: Vector3): boolean => {
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

class Chunk {
  index: number;
  origin: Vector3;
  blocks: number[];

  constructor(
    index: number,
    origin: Vector3,
    size: number,
    storeLocalPosition: Store,
    storeWorldPosition: Store,
    storeVertices: Store,
    storeNeighbours: Store
  ) {
    this.index = index;
    this.origin = origin;
    this.blocks = Array.from({ length: totalBlocksInChunk }).map((_, index) => {
      const id = this.index * size + index;
      const localPosition = calcBlockPositionForIndex(index);
      const worldPosition = localPosition.clone().add(this.origin);

      storeLocalPosition.x[id] = localPosition.x;
      storeLocalPosition.y[id] = localPosition.y;
      storeLocalPosition.z[id] = localPosition.z;

      storeWorldPosition.x[id] = worldPosition.x;
      storeWorldPosition.y[id] = worldPosition.y;
      storeWorldPosition.z[id] = worldPosition.z;

      storeVertices[0][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[1][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[2][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[3][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[4][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[5][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[6][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[7][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[8][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[9][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[10][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[11][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[12][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;
      storeVertices[13][id] = this.index < totalChunksInWorld / 2 ? 1 : 0;

      const neighbours = calcNeighboursForWorldPosition(worldPosition).map((neighbourPosition) => {
        if (isWorldPositionWithinBounds(neighbourPosition)) {
          const chunkOrigin = calcChunkPositionForWorldPosition(neighbourPosition);
          const chunkArrayPosition = calcChunkArrayPositionForPosition(chunkOrigin);
          const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
          const chunkIndex = calcChunkIndexForArrayPosition(chunkArrayPosition);

          const neighbourIndex = totalBlocksInChunk * chunkIndex + calcBlockIndexForPosition(blockPosition);

          return neighbourIndex;
        }

        return -1;
      });

      storeNeighbours.left[id] = neighbours[0];
      storeNeighbours.right[id] = neighbours[1];
      storeNeighbours.back[id] = neighbours[2];
      storeNeighbours.front[id] = neighbours[3];
      storeNeighbours.bottom[id] = neighbours[4];
      storeNeighbours.top[id] = neighbours[5];

      return id;
    });
  }
}

class World {
  private localPosition: Store;
  private worldPosition: Store;
  private vertices: Store;
  private neighbours: Store;
  private totalBlocks: number;
  private totalChunks: number;
  private totalBlocksInChunk: number;

  public chunks: Chunk[];

  public constructor(totalChunks: number, totalBlocks: number) {
    this.totalBlocks = totalBlocks;
    this.totalChunks = totalChunks;
    this.totalBlocksInChunk = totalBlocks / totalChunks;
    this.localPosition = createStore(localPositionSchema, totalBlocks);
    this.worldPosition = createStore(worldPositionSchema, totalBlocks);
    this.vertices = createStore(verticesSchema, totalBlocks);
    this.neighbours = createStore(neighboursSchema, totalBlocks);

    this.chunks = Array.from({ length: totalChunks }).map((_, index) => {
      const origin = calcChunkWorldPositionForIndex(index);
      return new Chunk(
        index,
        origin,
        this.totalBlocksInChunk,
        this.localPosition,
        this.worldPosition,
        this.vertices,
        this.neighbours
      );
    });
  }

  private isActive(id: number) {
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

    for (let i = 0; i < totalBlocksInWorld; i++) {
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

    if (id >= 0 && id < this.totalBlocks) {
      return {
        id: id,
        index: id % this.totalBlocksInChunk,
        parentChunk: Math.floor(id / this.totalBlocksInChunk),
        isActive: this.isActive(id),
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

  public setBlock({ id, localPosition, worldPosition, neighbours, vertices }: BlockType) {
    this.setLocalPosition(id, localPosition);
    this.setWorldPosition(id, worldPosition);
    this.setNeighbours(id, neighbours);
    this.setVertices(id, vertices);
  }
}

const world = new World(totalChunksInWorld, totalBlocksInWorld);

interface ChunkState {
  chunkRenderKeys: number[];

  updateRenderKey: (index: number) => void;
}

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

const useChunkState = create<ChunkState>()((set, get) => ({
  chunkRenderKeys: Array.from({ length: totalChunksInWorld }).map(() => 0),
  updateRenderKey: (index) => {
    const chunkRenderKeys = get().chunkRenderKeys.slice();
    chunkRenderKeys[index]++;
    set(() => ({ chunkRenderKeys }));
  },
}));

const useWorldStore = () => {
  const chunks = world.chunks;
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

  return { chunks, getBlock, setBlock, setBlocks, chunkRenderKeys };
};

export { useWorldStore };
