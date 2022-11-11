import { Html } from '@react-three/drei';
import { useEffect } from 'react';
import { calcTableIndex } from 'utils/blockUtils';
import { useMouseControls } from '../../hooks/mouseControls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import Mutator from './Mutator';
import Indicator from './Indicator';
import AddTrackBlock from './AddTrackBlock';

const SceneInterface = () => {
  const { blockHovered, blockMutated, setBlockMutated, currUISelection } = useInterfaceStore();

  const { leftButton, rightButton, drag } = useMouseControls();

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

  return (
    <group>
      {!blockMutated && blockHovered && (
        <Indicator {...blockHovered} showVertex={currUISelection === UISelection.SCULPT} />
      )}
      {currUISelection === UISelection.SCULPT && blockMutated && <Mutator {...blockMutated} />}
      {currUISelection === UISelection.ADDROAD && blockHovered && <AddTrackBlock block={blockHovered.block} />}
    </group>
  );
};

export default SceneInterface;
