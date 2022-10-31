import { Vector2, Vector3 } from 'three';
import { BlockType } from './blockUtils';
import { blockSize } from './constants';

enum BlockDirection {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

namespace BlockDirection {
  export function rotateCounterClockwise(value: BlockDirection): BlockDirection {
    return (value + (4 - 1)) % 4;
  }

  export function rotateClockwise(value: BlockDirection): BlockDirection {
    return (value + 1) % 4;
  }
}

const getHoveredVertex = (
  block: BlockType,
  uv: Vector2
): { index: number; position: Vector3; worldPosition: Vector3 } | null => {
  const vertexPosition = new Vector2(uv.x > 0.5 ? 0.5 : -0.5, uv.y > 0.5 ? -0.5 : 0.5);

  let index =
    vertexPosition.x < 0.5 && vertexPosition.y < 0.5
      ? 4
      : vertexPosition.x >= 0.5 && vertexPosition.y < 0.5
      ? 5
      : vertexPosition.x < 0.5 && vertexPosition.y >= 0.5
      ? 6
      : 7;

  if (block.vertices[index]) {
    const position = new Vector3(vertexPosition.x, 0.5, vertexPosition.y).multiply(blockSize);
    const worldPosition = block.worldPosition.clone().add(position);

    return { index, position, worldPosition };
  }

  index -= 4;

  if (block.vertices[index]) {
    const position = new Vector3(vertexPosition.x, -0.5, vertexPosition.y).multiply(blockSize);
    const worldPosition = block.worldPosition.clone().add(position);

    return { index, position, worldPosition };
  }

  // can happen when we are actualy hovering a vertex of a block below
  return null;
};

//

enum UISelection {
  ADDROAD,
  EDITROAD,
  SCULPT,
}

export { BlockDirection, UISelection, getHoveredVertex };
