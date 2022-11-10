import { TrackModel } from 'components/TrackModel';
import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { useMouseControls } from 'hooks/mouseControls';
import { useEffect, useMemo } from 'react';
import { Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';
import { blockSize } from 'utils/constants';
import { useInterfaceStore } from 'utils/interfaceStore';
import { UISelection } from 'utils/interfaceUtils';

type AddTrackProps = {
  block: BlockType;
};

const AddTrack = ({ block }: AddTrackProps) => {
  const position = useMemo(
    () => block.worldPosition.clone().add(new Vector3(0, blockSize.y, 0)),
    [block.worldPosition]
  );

  const { setCurrUISelection } = useInterfaceStore();

  const { length, setBlock } = useTrack();

  const { leftButton } = useMouseControls();

  useEffect(() => {
    if (leftButton && length === 0) {
      const trackBlock: TrackBlockType = {
        id: 0,
        worldPosition: position,
        direction: {
          from: TrackDirection.SOUTH,
          to: TrackDirection.NORTH,
          angle: TrackAngle.STRAIGHT,
        },
        track: {
          variation: TrackVariation.FORWARD,
          isPartial: false,
        },
      };
      setBlock(trackBlock);
      setCurrUISelection(UISelection.EDITROAD);

      console.log('tick');
    }
  }, [leftButton, position]);

  return <TrackModel variation={TrackVariation.FORWARD} angle={TrackAngle.STRAIGHT} position={position} scale={10} />;
};

export default AddTrack;
