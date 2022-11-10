import { Sphere } from '@react-three/drei';
import { BufferGeometry, Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';

type IndicatorProps = {
  block: BlockType;
  vertex: {
    index: number;
    position: Vector3;
  };
  geometry: BufferGeometry;
  showVertex: boolean;
};

const Indicator = ({ block, vertex, geometry, showVertex = false }: IndicatorProps) => {
  return (
    <group position={block.worldPosition}>
      {showVertex && (
        <Sphere args={[0.5]} position={vertex.position}>
          <meshBasicMaterial color={'#000'} />
        </Sphere>
      )}
      <mesh geometry={geometry} scale={1.001} position={[0, 0.1, 0]}>
        <meshBasicMaterial color={'#000'} />
      </mesh>
    </group>
  );
};

export default Indicator;
