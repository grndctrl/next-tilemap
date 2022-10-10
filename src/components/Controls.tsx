import { OrbitControls } from '@react-three/drei';
import { useInterfaceStore } from '../utils/interfaceStore';

const Controls = () => {
  const { blockMutated } = useInterfaceStore();

  return <>{/* <OrbitControls enabled={blockMutated === null} /> */}</>;
};

export default Controls;
