import { TrackBlockType } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { TrackModel } from 'models/TrackModel';
import { useEffect, useState } from 'react';
import { useInterfaceStore } from 'utils/interfaceStore';
import { UISelection } from 'utils/interfaceUtils';
import NextTrackBlock from './UserInterface/NextTrackBlock';

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

const Track = () => {
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
        // <TrackMesh key={`track-${index}`} trackBlock={trackBlock} />
        <TrackModel
          key={`track-${index}`}
          position={trackBlock.worldPosition}
          variation={trackBlock.track.variation}
          angle={trackBlock.direction.angle}
          rotation={[0, Math.PI * 0.5 * trackBlock.direction.from + Math.PI, 0]}
        />
      ))}
      {currUISelection === UISelection.EDITROAD && trackBlocks.length > 0 && (
        <NextTrackBlock lastBlock={trackBlocks[trackBlocks.length - 1]} />
      )}
    </group>
  );
};

export default Track;
