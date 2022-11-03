import { Vector3 } from "three";
import {
  calcNeighboursForWorldPosition,
  getVerticesForTableIndex,
} from "utils/blockUtils";
import {
  calcBlockIndexForPosition,
  calcBlockPositionForIndex,
  calcChunkArrayPositionForPosition,
  calcChunkIndexForArrayPosition,
  calcChunkPositionForWorldPosition,
  calcWorldIndexFromWorldPosition,
} from "utils/chunkUtils";
import createHook from "zustand";
import create from "zustand/vanilla";

import { totalBlocksInChunk } from "utils/constants";
import { isWorldPositionWithinBounds } from "utils/worldUtils";
import WorldStore from "./WorldStore";
import { WorldMeasurements } from ".";

interface ChunkState {
  chunkRenderKeys: number[];
  resetChunkRenderKeys: (totalChunksInWorld: number) => void;
  updateRenderKey: (index: number) => void;
}

const chunkStore = create<ChunkState>()((set, get) => ({
  chunkRenderKeys: [],
  resetChunkRenderKeys: (totalChunksInWorld: number) => {
    const chunkRenderKeys = Array.from({ length: totalChunksInWorld }).map(
      () => 0
    );
    set(() => ({ chunkRenderKeys }));
  },
  updateRenderKey: (index) => {
    const chunkRenderKeys = get().chunkRenderKeys.slice();
    chunkRenderKeys[index]++;
    set(() => ({ chunkRenderKeys }));
  },
}));

const useChunkStore = createHook(chunkStore);

class Chunk {
  private store: WorldStore;
  private measurements: WorldMeasurements;

  index: number;
  origin: Vector3;
  blocks: number[];

  constructor(
    index: number,
    origin: Vector3,
    measurements: WorldMeasurements,
    store: WorldStore
  ) {
    this.index = index;
    this.measurements = measurements;
    this.origin = origin;
    this.store = store;

    this.blocks = Array.from({
      length: this.measurements.totalBlocksInChunk,
    }).map((_, index) => {
      const id = this.index * this.measurements.totalBlocksInChunk + index;
      return id;
    });
  }

  public init() {
    for (let i = 0; i < this.blocks.length; i++) {
      const id = this.blocks[i];

      const localPosition = calcBlockPositionForIndex(i);

      const worldPosition = localPosition.clone().add(this.origin);

      const vertices = Array.from({ length: 14 }).map(
        () => this.index < this.measurements.totalChunksInWorld / 2
      );

      const neighbours = calcNeighboursForWorldPosition(
        worldPosition,
        this.measurements.worldSize
      ).map((neighbourPosition) => {
        if (
          isWorldPositionWithinBounds(
            neighbourPosition,
            this.measurements.worldSize
          )
        ) {
          const chunkOrigin = calcChunkPositionForWorldPosition(
            neighbourPosition,
            this.measurements.chunksInWorld
          );
          const chunkArrayPosition = calcChunkArrayPositionForPosition(
            chunkOrigin,
            this.measurements.chunksInWorld
          );
          const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
          const chunkIndex = calcChunkIndexForArrayPosition(
            chunkArrayPosition,
            this.measurements.chunksInWorld
          );

          const neighbourIndex =
            totalBlocksInChunk * chunkIndex +
            calcBlockIndexForPosition(blockPosition);

          return neighbourIndex;
        }

        return -1;
      });

      this.store.setBlock({
        id,
        localPosition,
        worldPosition,
        vertices,
        neighbours,
      });
    }
  }

  //

  public initFromTableIndices(tableIndices: number[]) {
    for (let i = 0; i < this.blocks.length; i++) {
      const id = this.blocks[i];

      const localPosition = calcBlockPositionForIndex(i);

      const worldPosition = localPosition.clone().add(this.origin);

      const worldIndex = calcWorldIndexFromWorldPosition(
        worldPosition,
        this.measurements.blocksInWorld
      );
      const vertices = getVerticesForTableIndex(tableIndices[worldIndex]);

      // const neighbours = calcNeighboursForWorldPosition(worldPosition).map((neighbourPosition) => {
      //   if (isWorldPositionWithinBounds(neighbourPosition)) {
      //     const chunkOrigin = calcChunkPositionForWorldPosition(neighbourPosition);
      //     const chunkArrayPosition = calcChunkArrayPositionForPosition(chunkOrigin);
      //     const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
      //     const chunkIndex = calcChunkIndexForArrayPosition(chunkArrayPosition);

      //     const neighbourIndex = totalBlocksInChunk * chunkIndex + calcBlockIndexForPosition(blockPosition);

      //     return neighbourIndex;
      //   }

      //   return -1;
      // });

      const neighbours = calcNeighboursForWorldPosition(
        worldPosition,
        this.measurements.worldSize
      ).map((neighbourPosition) => {
        if (
          isWorldPositionWithinBounds(
            neighbourPosition,
            this.measurements.worldSize
          )
        ) {
          const chunkOrigin = calcChunkPositionForWorldPosition(
            neighbourPosition,
            this.measurements.chunksInWorld
          );
          const chunkArrayPosition = calcChunkArrayPositionForPosition(
            chunkOrigin,
            this.measurements.chunksInWorld
          );
          const blockPosition = neighbourPosition.clone().sub(chunkOrigin);
          const chunkIndex = calcChunkIndexForArrayPosition(
            chunkArrayPosition,
            this.measurements.chunksInWorld
          );

          const neighbourIndex =
            totalBlocksInChunk * chunkIndex +
            calcBlockIndexForPosition(blockPosition);

          return neighbourIndex;
        }

        return -1;
      });

      this.store.setBlock({
        id,
        localPosition,
        worldPosition,
        vertices,
        neighbours,
      });
    }
  }

  //

  // public initWithData(
  //   data: any,
  //   storeLocalPosition: Store,
  //   storeWorldPosition: Store,
  //   storeVertices: Store,
  //   storeNeighbours: Store
  // ) {
  //   for (let i = 0; i < this.blocks.length; i++) {
  //     const id = this.blocks[i];
  //
  //     storeLocalPosition.x[id] = data.localPosition.x[id];
  //     storeLocalPosition.y[id] = data.localPosition.y[id];
  //     storeLocalPosition.z[id] = data.localPosition.z[id];
  //
  //     storeWorldPosition.x[id] = data.worldPosition.x[id];
  //     storeWorldPosition.y[id] = data.worldPosition.y[id];
  //     storeWorldPosition.z[id] = data.worldPosition.z[id];
  //
  //     for (let j = 0; j < 14; j++) {
  //       storeVertices[j][id] = data.vertices[j][id];
  //     }
  //
  //     storeNeighbours.left[id] = data.neighbours.left[id];
  //     storeNeighbours.right[id] = data.neighbours.right[id];
  //     storeNeighbours.back[id] = data.neighbours.back[id];
  //     storeNeighbours.front[id] = data.neighbours.front[id];
  //     storeNeighbours.bottom[id] = data.neighbours.bottom[id];
  //     storeNeighbours.top[id] = data.neighbours.top[id];
  //   }
  // }
  //
  //
}

export default Chunk;

export { useChunkStore, chunkStore };
