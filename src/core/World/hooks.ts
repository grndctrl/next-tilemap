import { useCallback, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { BlockType } from "utils/blockUtils";
import { convert2DHeightmapTo3DTableIndices } from "utils/worldUtils";
import { world, WorldMeasurements } from "./";
import createHook from "zustand";
import create from "zustand/vanilla";
import data from "../../../public/data.json";
import { decompressWorldToTableIndices } from "utils/worldUtils";

export enum WorldGeneratorState {
  WAITING,
  INIT_WORLD,
  SELECT_CHUNK_TO_GENERATE,
  GENERATE_CHUNK,
  SELECT_CHUNK_TO_MODIFY_1,
  MODIFY_CHUNK_1,
  SELECT_CHUNK_TO_MODIFY_2,
  MODIFY_CHUNK_2,
  FINISHED,
}

type WorldData = {
  measurements: {
    blocksInChunk: { x: number; y: number; z: number };
    blocksInWorld: { x: number; y: number; z: number };
    chunksInWorld: { x: number; y: number; z: number };
    blockSize: { x: number; y: number; z: number };
    chunkSize: { x: number; y: number; z: number };
    worldSize: { x: number; y: number; z: number };
    totalBlocksInChunk: number;
    totalBlocksInWorld: number;
    totalChunksInWorld: number;
  };
  tableIndices: number[][][];
};

interface WorldState {
  chunkRenderKeys: number[];
  resetChunkRenderKeys: (totalChunksInWorld: number) => void;
  updateChunkRenderKey: (index: number) => void;
}

const globalStore = create<WorldState>()((set, get) => ({
  chunkRenderKeys: [],

  resetChunkRenderKeys: (totalChunksInWorld: number) => {
    const chunkRenderKeys = Array.from({ length: totalChunksInWorld }).map(
      () => 0
    );
    set(() => ({ chunkRenderKeys }));
  },

  updateChunkRenderKey: (index) => {
    const chunkRenderKeys = get().chunkRenderKeys.slice();
    chunkRenderKeys[index]++;
    set(() => ({ chunkRenderKeys }));
  },
}));

const useGlobalStore = createHook(globalStore);

const useWorldGenerator = () => {
  const chunksInWorld = useRef<Vector3>(new Vector3(1, 1, 1));
  const [state, setState] = useState<WorldGeneratorState>(
    WorldGeneratorState.WAITING
  );
  const chunksToIterate = useRef<number[]>([]);
  const chunkIndex = useRef<number | null>(null);
  const tableIndices = useRef<number[]>([]);
  const progress = useRef<number>(0);
  const { resetChunkRenderKeys } = useGlobalStore();

  useEffect(() => {
    switch (state) {
      case WorldGeneratorState.INIT_WORLD:
        world.init(chunksInWorld.current);

        chunksToIterate.current = Array.from({
          length: world.measurements.totalChunksInWorld,
        }).map((_, index) => {
          return index;
        });

        setState(WorldGeneratorState.SELECT_CHUNK_TO_GENERATE);
        break;

      case WorldGeneratorState.SELECT_CHUNK_TO_GENERATE:
        if (chunksToIterate.current.length > 0) {
          chunkIndex.current = chunksToIterate.current[0];
          setState(WorldGeneratorState.GENERATE_CHUNK);
        } else {
          setState(WorldGeneratorState.WAITING);
        }
        break;

      case WorldGeneratorState.GENERATE_CHUNK:
        if (chunkIndex.current === null) return;

        progress.current =
          chunkIndex.current /
          (chunksInWorld.current.x *
            chunksInWorld.current.y *
            chunksInWorld.current.z -
            1);

        world
          .generateChunkFromTableIndices(
            chunkIndex.current,
            tableIndices.current
          )
          .then((chunk) => {
            world.chunks.push(chunk);

            if (chunksToIterate.current.length > 1) {
              chunksToIterate.current = chunksToIterate.current.slice(1);
              setState(WorldGeneratorState.SELECT_CHUNK_TO_GENERATE);
            } else {
              chunksToIterate.current = Array.from({
                length: world.measurements.totalChunksInWorld,
              }).map((_, index) => {
                return index;
              });
              setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_1);
            }
          });

        break;

      case WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_1:
        if (chunksToIterate.current.length > 0) {
          chunkIndex.current = chunksToIterate.current[0];
          setState(WorldGeneratorState.MODIFY_CHUNK_1);
        } else {
          chunksToIterate.current = Array.from({
            length: world.measurements.totalChunksInWorld,
          }).map((_, index) => {
            return world.measurements.totalChunksInWorld - index - 1;
          });
          setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_2);
        }
        break;

      case WorldGeneratorState.MODIFY_CHUNK_1:
        console.log(
          "🚀 ~ file: hooks.ts ~ line 93 ~ WorldGeneratorState.MODIFY_CHUNK_1",
          WorldGeneratorState.MODIFY_CHUNK_1
        );
        if (chunkIndex.current === null) return;

        progress.current =
          chunkIndex.current /
          (chunksInWorld.current.x *
            chunksInWorld.current.y *
            chunksInWorld.current.z -
            1);

        world.modifyChunk(chunkIndex.current, true).then(() => {
          chunksToIterate.current = chunksToIterate.current.slice(1);
          setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_1);
        });
        break;

      case WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_2:
        if (chunksToIterate.current.length > 0) {
          chunkIndex.current = chunksToIterate.current[0];
          setState(WorldGeneratorState.MODIFY_CHUNK_2);
        } else {
          resetChunkRenderKeys(
            chunksInWorld.current.x *
              chunksInWorld.current.y *
              chunksInWorld.current.z
          );
          setState(WorldGeneratorState.FINISHED);
        }
        break;

      case WorldGeneratorState.MODIFY_CHUNK_2:
        console.log(
          "🚀 ~ file: hooks.ts ~ line 116 ~ WorldGeneratorState.MODIFY_CHUNK_2",
          WorldGeneratorState.MODIFY_CHUNK_2
        );
        if (chunkIndex.current === null) return;

        progress.current =
          1 -
          chunkIndex.current /
            (chunksInWorld.current.x *
              chunksInWorld.current.y *
              chunksInWorld.current.z -
              1);

        world.modifyChunk(chunkIndex.current, false).then(() => {
          chunksToIterate.current = chunksToIterate.current.slice(1);
          setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_2);
        });

        break;
    }
  }, [state]);

  const initFromHeightmap = (
    heightmap: { height: number; tableIndex: number }[],
    measurements: { chunksInWorld: Vector3; blocksInWorld: Vector3 }
  ) => {
    console.log(heightmap);
    chunksInWorld.current = measurements.chunksInWorld;
    tableIndices.current = convert2DHeightmapTo3DTableIndices(
      heightmap,
      measurements.blocksInWorld
    );
    setState(WorldGeneratorState.INIT_WORLD);
  };

  const initFromJSON = ({
    tableIndices: compressedIndices,
    measurements,
  }: WorldData) => {
    decompressWorldToTableIndices(
      compressedIndices,
      new Vector3(
        measurements.blocksInWorld.x,
        measurements.blocksInWorld.y,
        measurements.blocksInWorld.z
      )
    ).then((decompressedTableIndices) => {
      tableIndices.current = decompressedTableIndices;
      chunksInWorld.current = new Vector3(
        measurements.chunksInWorld.x,
        measurements.chunksInWorld.y,
        measurements.chunksInWorld.z
      );
      setState(WorldGeneratorState.INIT_WORLD);
    });
  };

  return { state, initFromHeightmap, initFromJSON, progress };
};

const useWorld = () => {
  const { chunks, measurements } = world;

  const { totalChunksInWorld, totalBlocksInChunk } = measurements;
  const { chunkRenderKeys, updateChunkRenderKey } = useGlobalStore();

  const getBlock = useCallback(
    (query: number | Vector3) => world.getBlock(query),
    []
  );

  const setBlock = useCallback((block: BlockType) => {
    updateChunkRenderKey(block.parentChunk);
    world.setBlock(block);
  }, []);

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
        updateChunkRenderKey(chunk);
      });
    },
    [updateChunkRenderKey]
  );

  const exportJSON = useCallback(() => {
    return world.exportJSON();
  }, []);

  return {
    chunks,
    getBlock,
    setBlock,
    setBlocks,
    chunkRenderKeys,
    updateChunkRenderKey,
    exportJSON,
    measurements,
  };
};

export { useWorld, useWorldGenerator };
