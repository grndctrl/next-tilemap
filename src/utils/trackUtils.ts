import { Vector3 } from 'three';
import { GetBlock } from 'core/World';
import { blockSize } from './constants';
import { BlockType } from './blockUtils';
import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';

const getNextTrackBlock = (
  getBlock: GetBlock,
  lastBlock: TrackBlockType,
  trackSettings: { variation: TrackVariation; angle: TrackAngle }
): BlockType | null => {
  const nextPosition = new Vector3(blockSize.x, 0, 0);

  switch (lastBlock.direction.to) {
    case TrackDirection.NORTH:
      nextPosition.set(0, 0, -blockSize.z);
      break;
    case TrackDirection.SOUTH:
      nextPosition.set(0, 0, blockSize.z);
      break;
    case TrackDirection.WEST:
      nextPosition.set(-blockSize.x, 0, 0);
      break;
  }

  nextPosition.add(lastBlock.worldPosition);

  const positionAbove = nextPosition.clone().add(new Vector3(0, blockSize.y, 0));
  const positionBelow = nextPosition.clone().add(new Vector3(0, -blockSize.y, 0));

  if (trackSettings.angle === TrackAngle.UP) {
    return getBlock(positionAbove);
  } else if (trackSettings.angle === TrackAngle.DOWN) {
    return getBlock(positionBelow);
  }

  return getBlock(nextPosition);
};

export { getNextTrackBlock };
