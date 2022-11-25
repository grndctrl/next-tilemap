import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { calcTableIndex } from 'utils/blockUtils';
import { useMouseControls } from '../../hooks/mouseControls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import Mutator from './Mutator';
import Indicator from './Indicator';
import AddTrackBlock from './AddTrackBlock';
import NextTrackBlock from './NextTrackBlock';
import { useTrack } from 'core/Track/hooks';
import { TrackBlockType } from 'core/Track';
import { Vector3 } from 'three';

const SceneInterface = () => {
  const { blockHovered, blocksHovered, blockMutated, setBlockMutated, currUISelection } = useInterfaceStore();
  const { getBlock, length } = useTrack();
  const { leftButton, rightButton, drag } = useMouseControls();
  const [lastTrackBlock, setLastTrackBlock] = useState<TrackBlockType | null>(null);

  useEffect(() => {
    if (leftButton) {
      if (currUISelection === UISelection.SCULPT) {
        if (blockHovered && blockMutated === null) {
          if (blockHovered.block.neighbours.length === 0) {
          } else {
            setBlockMutated(blockHovered);
          }
        }
      }
    } else {
      setBlockMutated(null);
    }
  }, [blockHovered, blockMutated, leftButton, setBlockMutated]);

  useEffect(() => {
    const lastBlock = getBlock(length - 1);
    setLastTrackBlock(lastBlock);
  }, [getBlock, length]);

  return (
    <group>
      {currUISelection === UISelection.SCULPT && blockMutated && <Mutator {...blockMutated} />}
      {currUISelection === UISelection.ADDROAD && blocksHovered && <AddTrackBlock {...blocksHovered} />}
      {currUISelection === UISelection.EDITROAD && lastTrackBlock && <NextTrackBlock lastBlock={lastTrackBlock} />}

      {!blockMutated && blocksHovered && (
        <Indicator {...blocksHovered} showVertex={currUISelection === UISelection.SCULPT} />
      )}
    </group>
  );
};

export default SceneInterface;
