import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { useWorld } from 'core/World';
import { TrackModel } from 'models/TrackModel';
import next from 'next';
import { useEffect } from 'react';
import { Vector3 } from 'three';
import { calcTableIndex } from 'utils/blockUtils';
import { blockSize } from 'utils/constants';
import { useInterfaceStore } from 'utils/interfaceStore';
import { getNextBlock } from 'utils/trackUtils';

type NextTrackBlockProps = {
  lastBlock: TrackBlockType;
};

const NextTrackBlock = ({ lastBlock }: NextTrackBlockProps) => {
  const { getBlock } = useWorld();
  const { getBlock: getTrackBlock } = useTrack();
  const trackSettings = useInterfaceStore((state) => state.trackSettings);
  const setNextTrackBlock = useInterfaceStore((state) => state.setNextTrackBlock);
  const nextTrackBlock = useInterfaceStore((state) => state.nextTrackBlock);

  useEffect(() => {
    console.log(lastBlock);
  }, []);
  useEffect(() => {
    const nextBlock = getNextBlock(getBlock, lastBlock, trackSettings);

    if (!nextBlock) return;

    let blocked = false;

    const trackAtPosition = getTrackBlock(nextBlock.worldPosition);

    if (trackAtPosition) {
      if (lastBlock.direction.to === (trackAtPosition.direction.from + 2) % 4) {
        setNextTrackBlock('closed');
        return;
      }

      setNextTrackBlock('blocked');
      return;
    }

    if (trackSettings.angle === TrackAngle.UP) {
      const blockBelow = getBlock(nextBlock.worldPosition.clone().sub(new Vector3(0, blockSize.y, 0)));

      if (blockBelow) {
        const tableIndex = calcTableIndex(blockBelow.vertices);

        if (trackSettings.variation === TrackVariation.FORWARD) {
          switch (lastBlock.direction.to) {
            case TrackDirection.NORTH:
              if (tableIndex !== 5951 && tableIndex !== 5675 && tableIndex !== 5399 && tableIndex !== 0) {
                blocked = true;
              }
              break;
            case TrackDirection.EAST:
              if (tableIndex !== 7855 && tableIndex !== 5675 && tableIndex !== 6798 && tableIndex !== 0) {
                blocked = true;
              }
              break;
            case TrackDirection.SOUTH:
              if (tableIndex !== 7119 && tableIndex !== 6477 && tableIndex !== 6798 && tableIndex !== 0) {
                blocked = true;
              }
              break;
            case TrackDirection.WEST:
              if (tableIndex !== 7519 && tableIndex !== 6477 && tableIndex !== 5399 && tableIndex !== 0) {
                blocked = true;
              }
              break;
          }
        }
      }
    } else if (trackSettings.angle === TrackAngle.DOWN) {
      const tableIndex = calcTableIndex(nextBlock.vertices);

      if (trackSettings.variation === TrackVariation.FORWARD) {
        switch (lastBlock.direction.to) {
          case TrackDirection.SOUTH:
            if (tableIndex !== 5951 && tableIndex !== 5675 && tableIndex !== 5399 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.WEST:
            if (tableIndex !== 7855 && tableIndex !== 5675 && tableIndex !== 6798 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.NORTH:
            if (tableIndex !== 7119 && tableIndex !== 6477 && tableIndex !== 6798 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.EAST:
            if (tableIndex !== 7519 && tableIndex !== 6477 && tableIndex !== 5399 && tableIndex !== 0) {
              blocked = true;
            }
            break;
        }
      }
    } else {
      const tableIndex = calcTableIndex(nextBlock.vertices);

      if (trackSettings.variation === TrackVariation.TURN_LEFT) {
        switch (lastBlock.direction.to) {
          case TrackDirection.NORTH:
            if (tableIndex !== 5675 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.EAST:
            if (tableIndex !== 6798 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.SOUTH:
            if (tableIndex !== 6477 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.WEST:
            if (tableIndex !== 5399 && tableIndex !== 0) {
              blocked = true;
            }
            break;
        }
      } else if (trackSettings.variation === TrackVariation.TURN_RIGHT) {
        switch (lastBlock.direction.to) {
          case TrackDirection.NORTH:
            if (tableIndex !== 5399 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.EAST:
            if (tableIndex !== 5675 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.SOUTH:
            if (tableIndex !== 6798 && tableIndex !== 0) {
              blocked = true;
            }
            break;
          case TrackDirection.WEST:
            if (tableIndex !== 6477 && tableIndex !== 0) {
              blocked = true;
            }
            break;
        }
      } else {
        if (tableIndex > 0) {
          blocked = true;
        }
      }
    }

    if (blocked) {
      setNextTrackBlock('blocked');
      return;
    }

    const from = (lastBlock.direction.to + 2) % 4;
    let to = lastBlock.direction.to;

    if (trackSettings.variation === TrackVariation.TURN_LEFT) {
      to = (lastBlock.direction.to + 1) % 4;
    } else if (trackSettings.variation === TrackVariation.TURN_RIGHT) {
      to = (lastBlock.direction.to + 3) % 4;
    }

    const trackBlock: TrackBlockType = {
      id: lastBlock.id + 1,
      worldPosition: nextBlock.worldPosition,
      direction: {
        from,
        to,
        angle: trackSettings.angle,
      },
      track: {
        variation: trackSettings.variation,
        isPartial: false,
      },
    };

    setNextTrackBlock(trackBlock);
  }, [getBlock, lastBlock, setNextTrackBlock, trackSettings]);

  return (
    <>
      {nextTrackBlock !== 'blocked' && nextTrackBlock !== 'closed' && (
        <group position={nextTrackBlock.worldPosition.clone()}>
          <TrackModel
            variation={nextTrackBlock.track.variation}
            angle={nextTrackBlock.direction.angle}
            rotation={[0, Math.PI * 0.5 * ((lastBlock.direction.to + 2) % 4) + Math.PI, 0]}
            color={'orange'}
          />
        </group>
      )}
    </>
  );
};
export default NextTrackBlock;
