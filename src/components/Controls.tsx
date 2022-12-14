import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useInterfaceStore } from '../utils/interfaceStore';

const Controls = () => {
  const { blockMutated, currUISelection } = useInterfaceStore();
  const { camera } = useThree();

  const angle = -15 * (Math.PI / 180);

  return (
    <>
      <OrbitControls
        enabled={currUISelection === null}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
      />
    </>
  );
};

export default Controls;
