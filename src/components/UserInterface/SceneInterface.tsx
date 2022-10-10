import { useEffect } from 'react';
import { useMouseControls } from '../../hooks/controls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import Mutator from '../Mutator';
import Indicator from './../Indicator';

const SceneInterface = () => {
  const { blockHovered, blockMutated, setBlockMutated, currUISelection } = useInterfaceStore();

  const { leftButton, rightButton, drag } = useMouseControls();

  useEffect(() => {
    if (leftButton) {
      if (currUISelection === UISelection.SCULPT) {
        if (blockHovered && blockMutated === null) {
          if (blockHovered.block.neighbours.length === 0) {
            console.log('TOCK');
          } else {
            console.log('TICK');
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
    </group>
  );
};

export default SceneInterface;
