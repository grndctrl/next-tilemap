import { Sphere } from '@react-three/drei';
import { BufferGeometry, Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';

type IndicatorProps = {
  blockHovered: {
    block: BlockType;
    vertex: { index: number; position: Vector3 };
    geometry: BufferGeometry;
  };
  neighbours: {
    block: BlockType;
    position: Vector3;
    geometry: BufferGeometry;
  }[];
  showVertex: boolean;
};

const Indicator = ({ blockHovered, neighbours, showVertex = false }: IndicatorProps) => {
  return (
    <group position={blockHovered.block.worldPosition.clone().add(new Vector3(0, 0.1, 0))}>
      {showVertex && (
        <Sphere args={[0.5]} position={blockHovered.vertex.position}>
          <meshBasicMaterial color={'#f00'} />
        </Sphere>
      )}
      <mesh geometry={blockHovered.geometry}>
        <meshBasicMaterial color="black" />
      </mesh>
      {neighbours.map(({ position, geometry }, index) => {
        return (
          <mesh key={`neighbours-${index}`} position={position} geometry={geometry}>
            <meshBasicMaterial color="black" />
          </mesh>
        );
      })}
    </group>
  );
};

export default Indicator;
