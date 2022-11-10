import { Box } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { BlockType } from '../utils/blockUtils';
import { blockSize } from 'utils/constants';
import { useInterfaceStore } from '../utils/interfaceStore';
import { UISelection } from '../utils/interfaceUtils';
import { getNextTrackBlock } from 'utils/trackUtils';
import { TrackModel } from './TrackModel';
import { Vector3 } from 'three';
import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { useWorld } from 'core/World';
import { colors } from 'utils/tailwindDefaults';

type NextRoadBlockProps = {
  lastBlock: TrackBlockType;
};

const NextRoadBlock = ({ lastBlock }: NextRoadBlockProps) => {
  const { getBlock } = useWorld();
  const trackSettings = useInterfaceStore((state) => state.trackSettings);
  const setNextTrackBlock = useInterfaceStore((state) => state.setNextTrackBlock);
  const nextTrackBlock = useInterfaceStore((state) => state.nextTrackBlock);
  // const [nextBlock, setNextBlock] = useState<BlockType | null>(null);
  // const [position, setPosition] = useState<Vector3>(new Vector3());

  useEffect(() => {
    const nextBlock = getNextTrackBlock(getBlock, lastBlock, trackSettings);
    if (nextBlock) {
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

      console.log(trackBlock);
      setNextTrackBlock(trackBlock);
    }
  }, [getBlock, lastBlock, setNextTrackBlock, trackSettings]);

  return (
    <>
      {nextTrackBlock && (
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

type TrackMeshProps = {
  trackBlock: TrackBlockType;
};

const TrackMesh = ({ trackBlock }: TrackMeshProps) => {
  return (
    <group position={trackBlock.worldPosition}>
      <TrackModel
        variation={trackBlock.track.variation}
        angle={trackBlock.direction.angle}
        rotation={[0, Math.PI * 0.5 * trackBlock.direction.from + Math.PI, 0]}
      />
      {/* <Box args={[1, 0.5, 1]}>
        <meshBasicMaterial color={'black'} wireframe />
      </Box> */}
    </group>
  );
};

const TrackBlock = () => {
  const currUISelection = useInterfaceStore((state) => state.currUISelection);
  const { length, getBlock } = useTrack();

  const [trackBlocks, setTrackBlocks] = useState<TrackBlockType[]>([]);

  useEffect(() => {
    const currBlocks: TrackBlockType[] = [];

    Array.from({ length }).forEach((_, index) => {
      const block = getBlock(index);
      if (block) {
        currBlocks.push(block);
      }
    });

    setTrackBlocks(currBlocks);
  }, [getBlock, length]);

  useEffect(() => {
    console.log('trackBlocks', trackBlocks);
  }, [trackBlocks]);

  return (
    <group>
      {trackBlocks.map((trackBlock, index) => (
        <TrackMesh key={`track-${index}`} trackBlock={trackBlock} />
      ))}
      {currUISelection === UISelection.EDITROAD && trackBlocks.length > 0 && (
        <NextRoadBlock lastBlock={trackBlocks[trackBlocks.length - 1]} />
      )}
    </group>
  );
};

export default TrackBlock;
