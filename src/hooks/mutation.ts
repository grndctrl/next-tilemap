import { uniq } from 'lodash';
import { useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { BlockType, calcTableIndex, getVerticesForTableIndex } from '../utils/blockUtils';
import { blockSize } from '../utils/constants';
import { useWorld } from 'core/World';

interface GetBlock {
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

const getBlockForAddition = (
  getBlock: GetBlock,
  vertex: number,
  worldPosition: Vector3
): { block: BlockType; vertex: number } | null => {
  const block = getBlock(worldPosition);
  if (block) {
    if (block.vertices[vertex + 4]) {
      return null;
    }

    if (block.vertices[vertex]) {
      return { block: block, vertex: vertex };
    }

    const blockBelow = getBlock(worldPosition.clone().add(new Vector3(0, -blockSize.y, 0)));
    if (blockBelow?.vertices[vertex + 4]) {
      return { block: block, vertex: vertex };
    }
  }

  return null;
};

const getBlocksForAddition = (getBlock: GetBlock, vertex: number, block: BlockType) => {
  const blocks: ({ block: BlockType; vertex: number } | null)[] = [];

  switch (vertex) {
    // 3  2
    // 1  0
    case 0:
      blocks[0] = getBlockForAddition(
        getBlock,
        3,
        block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, -blockSize.z))
      );
      blocks[1] = getBlockForAddition(getBlock, 2, block.worldPosition.clone().add(new Vector3(0, 0, -blockSize.z)));
      blocks[2] = getBlockForAddition(getBlock, 1, block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, 0)));
      blocks[3] = { vertex: 0, block };
      break;
    case 1:
      blocks[0] = getBlockForAddition(getBlock, 3, block.worldPosition.clone().add(new Vector3(0, 0, -blockSize.z)));
      blocks[1] = getBlockForAddition(
        getBlock,
        2,
        block.worldPosition.clone().add(new Vector3(blockSize.x, 0, -blockSize.z))
      );
      blocks[2] = { vertex: 1, block };
      blocks[3] = getBlockForAddition(getBlock, 0, block.worldPosition.clone().add(new Vector3(blockSize.x, 0, 0)));
      break;
    case 2:
      blocks[0] = getBlockForAddition(getBlock, 3, block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, 0)));
      blocks[1] = { vertex: 2, block };
      blocks[2] = getBlockForAddition(
        getBlock,
        1,
        block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, blockSize.z))
      );
      blocks[3] = getBlockForAddition(getBlock, 0, block.worldPosition.clone().add(new Vector3(0, 0, blockSize.z)));
      break;
    case 3:
      blocks[0] = { vertex: 3, block };
      blocks[1] = getBlockForAddition(getBlock, 2, block.worldPosition.clone().add(new Vector3(blockSize.x, 0, 0)));
      blocks[2] = getBlockForAddition(getBlock, 1, block.worldPosition.clone().add(new Vector3(0, 0, blockSize.z)));
      blocks[3] = getBlockForAddition(
        getBlock,
        0,
        block.worldPosition.clone().add(new Vector3(blockSize.x, 0, blockSize.z))
      );
      break;
  }

  const blocksBelow = [];

  return blocks;
};

const calcAdditionTableIndex = (vertex: number, fromTableIndex: number) => {
  switch (vertex) {
    case 0:
      switch (fromTableIndex) {
        // empty
        case 0:
          return 5399;
        //corners
        case 5675:
          return 5951;
        case 6477:
          return 7519;
        case 6798:
          return 8095;
        // ramps
        case 7119:
          return 16351;
        case 7855:
          return 16319;
        //valley
        case 8047:
          return 16255;
        // corner ramp
        case 16367:
          return 16383;
      }
      break;
    case 1:
      switch (fromTableIndex) {
        // empty
        case 0:
          return 5675;
        //corners
        case 5399:
          return 5951;
        case 6477:
          return 8047;
        case 6798:
          return 7855;
        // ramps
        case 7119:
          return 16367;
        case 7519:
          return 16255;
        //valley
        case 8095:
          return 16319;
        // corner ramp
        case 16351:
          return 16383;
      }
      break;
    case 2:
      switch (fromTableIndex) {
        // empty
        case 0:
          return 6477;
        //corners
        case 5399:
          return 7519;
        case 5675:
          return 8047;
        case 6798:
          return 7119;
        // ramps
        case 5951:
          return 16255;
        case 7855:
          return 16367;
        //valley
        case 8095:
          return 16351;
        // corner ramp
        case 16319:
          return 16383;
      }
      break;
    case 3:
      switch (fromTableIndex) {
        // empty
        case 0:
          return 6798;
        //corners
        case 5399:
          return 8095;
        case 5675:
          return 7855;
        case 6477:
          return 7119;
        // ramps
        case 5951:
          return 16319;
        case 7519:
          return 16351;
        //valley
        case 8047:
          return 16367;
        // corner ramp
        case 16255:
          return 16383;
      }
      break;
  }

  return 0;
};

//

const getBlockForRemoval = (
  getBlock: GetBlock,
  vertex: number,
  worldPosition: Vector3
): { block: BlockType; vertex: number } | null => {
  const blockAbove = getBlock(worldPosition.clone().add(new Vector3(0, blockSize.y, 0)));

  if (blockAbove) {
    if (blockAbove.vertices[vertex]) {
      return null;
    }

    const block = getBlock(worldPosition);

    if (block?.vertices[vertex]) {
      return { block: block, vertex: vertex };
    }
  }

  return null;
};

const getBlocksForRemoval = (getBlock: GetBlock, vertex: number, block: BlockType) => {
  const blocks: ({ block: BlockType; vertex: number } | null)[] = [];

  switch (vertex) {
    // 7  6
    // 5  4
    case 4:
      blocks[0] = getBlockForRemoval(
        getBlock,
        7,
        block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, -blockSize.z))
      );
      blocks[1] = getBlockForRemoval(getBlock, 6, block.worldPosition.clone().add(new Vector3(0, 0, -blockSize.z)));
      blocks[2] = getBlockForRemoval(getBlock, 5, block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, 0)));
      blocks[3] = { vertex: 4, block };
      break;
    case 5:
      blocks[0] = getBlockForRemoval(getBlock, 7, block.worldPosition.clone().add(new Vector3(0, 0, -blockSize.z)));
      blocks[1] = getBlockForRemoval(
        getBlock,
        6,
        block.worldPosition.clone().add(new Vector3(blockSize.x, 0, -blockSize.z))
      );
      blocks[2] = { vertex: 5, block };
      blocks[3] = getBlockForRemoval(getBlock, 4, block.worldPosition.clone().add(new Vector3(blockSize.x, 0, 0)));
      break;
    case 6:
      blocks[0] = getBlockForRemoval(getBlock, 7, block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, 0)));
      blocks[1] = { vertex: 6, block };
      blocks[2] = getBlockForRemoval(
        getBlock,
        5,
        block.worldPosition.clone().add(new Vector3(-blockSize.x, 0, blockSize.z))
      );
      blocks[3] = getBlockForRemoval(getBlock, 4, block.worldPosition.clone().add(new Vector3(0, 0, blockSize.z)));
      break;
    case 7:
      blocks[0] = { vertex: 7, block };
      blocks[1] = getBlockForRemoval(getBlock, 6, block.worldPosition.clone().add(new Vector3(blockSize.x, 0, 0)));
      blocks[2] = getBlockForRemoval(getBlock, 5, block.worldPosition.clone().add(new Vector3(0, 0, blockSize.z)));
      blocks[3] = getBlockForRemoval(
        getBlock,
        4,
        block.worldPosition.clone().add(new Vector3(blockSize.x, 0, blockSize.z))
      );
      break;
  }

  const blocksBelow = [];

  return blocks;
};

const calcRemovalTableIndex = (vertex: number, fromTableIndex: number) => {
  switch (vertex) {
    case 4:
      switch (fromTableIndex) {
        //corner
        case 5399:
          return 0;
        // ramps
        case 5951:
          return 5675;
        case 7519:
          return 6477;
        //valley
        case 8095:
          return 6798;
        // corner ramps
        case 16351:
          return 7119;
        case 16319:
          return 7855;
        case 16255:
          return 8047;
        // full
        case 16383:
          return 16367;
      }
      break;
    case 5:
      switch (fromTableIndex) {
        //corner
        case 5675:
          return 0;
        // ramps
        case 5951:
          return 5399;
        case 7855:
          return 6798;
        //valley
        case 8047:
          return 6477;
        // corner ramps
        case 16367:
          return 7119;
        case 16319:
          return 8095;
        case 16255:
          return 7519;
        // full
        case 16383:
          return 16351;
      }
      break;
    case 6:
      switch (fromTableIndex) {
        //corner
        case 6477:
          return 0;
        // ramps
        case 7519:
          return 5399;
        case 7119:
          return 6798;
        //valley
        case 8047:
          return 5675;
        // corner ramps
        case 16367:
          return 7855;
        case 16351:
          return 8095;
        case 16255:
          return 5951;
        // full
        case 16383:
          return 16319;
      }
      break;
    case 7:
      switch (fromTableIndex) {
        //corner
        case 6798:
          return 0;
        // ramps
        case 7855:
          return 5675;
        case 7119:
          return 6477;
        //valley
        case 8095:
          return 5399;
        // corner ramps
        case 16367:
          return 8047;
        case 16351:
          return 7519;
        case 16319:
          return 5951;
        // full
        case 16383:
          return 16255;
      }
      break;
  }

  return 0;
};

//

const useMutation = (vertex: number, block: BlockType) => {
  const { getBlock } = useWorld();
  const [addition, setAdditon] = useState<BlockType[]>([]);
  const [removal, setRemoval] = useState<BlockType[]>([]);
  const [reset, setReset] = useState<BlockType[]>([]);

  // 1. get blocks for addition
  // 1.1 if vertex is 0 - 3, blocks are current level (vertex 0 - 3) and below (vertex 4 - 7)
  useEffect(() => {
    let blocksForAddition: ({
      block: BlockType;
      vertex: number;
    } | null)[] = [];

    if (vertex < 4) {
      blocksForAddition = getBlocksForAddition(getBlock, vertex, block);
    } else {
      const positionAbove = block.worldPosition.clone().add(new Vector3(0, blockSize.y, 0));

      const blockAbove = getBlock(positionAbove);
      if (blockAbove) {
        blocksForAddition = getBlocksForAddition(getBlock, vertex - 4, blockAbove);
      }
    }

    // 2. get blocks for removal
    // 2.1 blocks for removal are blocks below addition
    let blocksForRemoval: ({
      block: BlockType;
      vertex: number;
    } | null)[] = [];

    if (vertex >= 4) {
      blocksForRemoval = getBlocksForRemoval(getBlock, vertex, block);
    } else {
      const blockBelow = getBlock(block.worldPosition.clone().add(new Vector3(0, -blockSize.y, 0)));
      if (blockBelow) {
        blocksForRemoval = getBlocksForRemoval(getBlock, vertex + 4, blockBelow);
      }
    }

    let currentBlocks: BlockType[] = [];

    // 4. create addition state
    const additionBlocks: BlockType[] = [];
    blocksForAddition.forEach((addition) => {
      if (addition) {
        const additionBlockBefore: BlockType = { ...addition.block };

        const tableIndex = calcTableIndex(addition.block.vertices);
        const additionTableIndex = calcAdditionTableIndex(addition.vertex, tableIndex);

        // const additionBlock: BlockType = {
        //   id: addition.block.id,
        //   index: addition.block.index,
        //   isActive: additionTableIndex > 0,
        //   neighbours: addition.block.neighbours,
        //   parentChunk: addition.block.parentChunk,
        //   localPosition: addition.block.localPosition,
        //   vertices: getVerticesForTableIndex(additionTableIndex),
        //   worldPosition: addition.block.worldPosition,
        // };

        const additionBlock: BlockType = {
          ...addition.block,
          isActive: additionTableIndex > 0,
          vertices: getVerticesForTableIndex(additionTableIndex),
        };

        currentBlocks.push(addition.block);
        additionBlocks.push(additionBlock);

        const oneBlockBelow = getBlock(additionBlock.worldPosition.clone().add(new Vector3(0, -blockSize.y, 0)));
        const twoBlocksBelow = getBlock(additionBlock.worldPosition.clone().add(new Vector3(0, -2 * blockSize.y, 0)));
        if (oneBlockBelow) {
          let belowTableIndex = 16383;

          if (!additionBlock.vertices[0] && !oneBlockBelow.vertices[4]) {
            belowTableIndex = 16367;
          } else if (!additionBlock.vertices[1] && !oneBlockBelow.vertices[5]) {
            belowTableIndex = 16351;
          } else if (!additionBlock.vertices[2] && !oneBlockBelow.vertices[6]) {
            belowTableIndex = 16319;
          } else if (!additionBlock.vertices[3] && !oneBlockBelow.vertices[7]) {
            belowTableIndex = 16255;
          }

          currentBlocks.push(oneBlockBelow);
          additionBlocks.push({
            id: oneBlockBelow.id,
            index: oneBlockBelow.index,
            isActive: true,
            neighbours: oneBlockBelow.neighbours,
            parentChunk: oneBlockBelow.parentChunk,
            localPosition: oneBlockBelow.localPosition,
            vertices: getVerticesForTableIndex(belowTableIndex),
            worldPosition: oneBlockBelow.worldPosition,
          });

          if (belowTableIndex !== 16383 && twoBlocksBelow) {
            currentBlocks.push(twoBlocksBelow);
            additionBlocks.push({
              id: twoBlocksBelow.id,
              index: twoBlocksBelow.index,
              isActive: true,
              neighbours: twoBlocksBelow.neighbours,
              parentChunk: twoBlocksBelow.parentChunk,
              localPosition: twoBlocksBelow.localPosition,
              vertices: getVerticesForTableIndex(16383),
              worldPosition: twoBlocksBelow.worldPosition,
            });
          }
        }
      }
    });

    // 5. create removal state
    const removalBlocks: BlockType[] = [];
    blocksForRemoval.forEach((removal) => {
      if (removal) {
        const tableIndex = calcTableIndex(removal.block.vertices);
        const removalTableIndex = calcRemovalTableIndex(removal.vertex, tableIndex);

        currentBlocks.push(removal.block);
        const removalBlock = {
          id: removal.block.id,
          index: removal.block.index,
          isActive: removalTableIndex > 0,
          neighbours: removal.block.neighbours,
          parentChunk: removal.block.parentChunk,
          localPosition: removal.block.localPosition,
          vertices: getVerticesForTableIndex(removalTableIndex),
          worldPosition: removal.block.worldPosition,
        };
        removalBlocks.push(removalBlock);

        const oneBlockAbove = getBlock(removalBlock.worldPosition.clone().add(new Vector3(0, blockSize.y, 0)));
        const twoBlocksAbove = getBlock(removalBlock.worldPosition.clone().add(new Vector3(0, 2 * blockSize.y, 0)));

        if (oneBlockAbove) {
          let aboveTableIndex = 0;

          if (
            removalTableIndex === 16367 &&
            oneBlockAbove.vertices[1] &&
            oneBlockAbove.vertices[2] &&
            oneBlockAbove.vertices[3]
          ) {
            aboveTableIndex = 6798;
          } else if (
            removalTableIndex === 16351 &&
            oneBlockAbove.vertices[0] &&
            oneBlockAbove.vertices[2] &&
            oneBlockAbove.vertices[3]
          ) {
            aboveTableIndex = 6477;
          } else if (
            removalTableIndex === 16319 &&
            oneBlockAbove.vertices[0] &&
            oneBlockAbove.vertices[1] &&
            oneBlockAbove.vertices[3]
          ) {
            aboveTableIndex = 5675;
          } else if (
            removalTableIndex === 16255 &&
            oneBlockAbove.vertices[0] &&
            oneBlockAbove.vertices[1] &&
            oneBlockAbove.vertices[2]
          ) {
            aboveTableIndex = 5399;
          }

          currentBlocks.push(oneBlockAbove);
          removalBlocks.push({
            id: oneBlockAbove.id,
            index: oneBlockAbove.index,
            isActive: aboveTableIndex > 0,
            neighbours: oneBlockAbove.neighbours,
            parentChunk: oneBlockAbove.parentChunk,
            localPosition: oneBlockAbove.localPosition,
            vertices: getVerticesForTableIndex(aboveTableIndex),
            worldPosition: oneBlockAbove.worldPosition,
          });

          if (aboveTableIndex !== 0 && twoBlocksAbove) {
            currentBlocks.push(twoBlocksAbove);
            removalBlocks.push({
              id: twoBlocksAbove.id,
              index: twoBlocksAbove.index,
              isActive: false,
              neighbours: twoBlocksAbove.neighbours,
              parentChunk: twoBlocksAbove.parentChunk,
              localPosition: twoBlocksAbove.localPosition,
              vertices: getVerticesForTableIndex(0),
              worldPosition: twoBlocksAbove.worldPosition,
            });
          }
        }
      }
    });

    // 3. filter currentBlocks duplicates
    currentBlocks = uniq(currentBlocks);

    setAdditon(additionBlocks);
    setRemoval(removalBlocks);
    setReset(currentBlocks);
  }, []);

  return { addition, removal, reset };
};

export { useMutation };
