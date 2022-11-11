import { TrackBlockType, TrackVariation } from 'core/Track';
import { useWorld } from 'core/World';
import { TrackModel } from 'models/TrackModel';
import { useEffect } from 'react';
import { getNextTrackBlock } from 'utils/trackUtils';
import { useInterfaceStore } from 'utils/interfaceStore';

type NextTrackBlockProps = {
  lastBlock: TrackBlockType;
};

const NextTrackBlock = ({ lastBlock }: NextTrackBlockProps) => {
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
export default NextTrackBlock;
