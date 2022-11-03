import { useCallback, useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';
import { calcTableIndicesFromHeightmap } from 'utils/worldUtils';
import { world } from './';
import { useChunkStore } from './Chunk';

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

const useWorldGenerator = () => {
  const chunksInWorld = useRef<Vector3>(new Vector3(1, 1, 1));
  const [state, setState] = useState<WorldGeneratorState>(WorldGeneratorState.WAITING);
  // const [progress, setProgress] = useState<number>(0);
  const chunksToIterate = useRef<number[]>([]);
  const chunkIndex = useRef<number | null>(null);
  const tableIndices = useRef<number[]>([]);
  const progress = useRef<number>(0);

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
          chunkIndex.current / (chunksInWorld.current.x * chunksInWorld.current.y * chunksInWorld.current.z - 1);

        world.generateChunkFromTableIndices(chunkIndex.current, tableIndices.current).then((chunk) => {
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
            return index;
          });
          setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_2);
        }
        break;

      case WorldGeneratorState.MODIFY_CHUNK_1:
        console.log(
          '🚀 ~ file: hooks.ts ~ line 93 ~ WorldGeneratorState.MODIFY_CHUNK_1',
          WorldGeneratorState.MODIFY_CHUNK_1
        );
        if (chunkIndex.current === null) return;

        progress.current =
          chunkIndex.current / (chunksInWorld.current.x * chunksInWorld.current.y * chunksInWorld.current.z - 1);

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
          setState(WorldGeneratorState.FINISHED);
        }
        break;

      case WorldGeneratorState.MODIFY_CHUNK_2:
        console.log(
          '🚀 ~ file: hooks.ts ~ line 116 ~ WorldGeneratorState.MODIFY_CHUNK_2',
          WorldGeneratorState.MODIFY_CHUNK_2
        );
        if (chunkIndex.current === null) return;

        progress.current =
          chunkIndex.current / (chunksInWorld.current.x * chunksInWorld.current.y * chunksInWorld.current.z - 1);

        world.modifyChunk(chunkIndex.current, false).then(() => {
          chunksToIterate.current = chunksToIterate.current.slice(1);
          setState(WorldGeneratorState.SELECT_CHUNK_TO_MODIFY_2);
        });

        break;
    }
  }, [state]);

  const init = (
    heightmap: { height: number; tableIndex: number }[],
    measurements: { chunksInWorld: Vector3; blocksInWorld: Vector3 }
  ) => {
    console.log(heightmap);
    chunksInWorld.current = measurements.chunksInWorld;
    tableIndices.current = calcTableIndicesFromHeightmap(heightmap, measurements.blocksInWorld);
    setState(WorldGeneratorState.INIT_WORLD);
  };

  return { state, init, progress };
};

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

  return {
    chunks,
    getBlock,
    setBlock,
    setBlocks,
    chunkRenderKeys,
    updateRenderKey,
    measurements,
  };
};

export { useWorld, useWorldGenerator };
