import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { BufferGeometry, Mesh, Raycaster, Vector3 } from 'three';
import { useMutation } from '../hooks/mutation';
import { useWorldStore } from '../utils/worldStore';
import { blockSize } from '../utils/constants';
import { useInterfaceStore } from '../utils/interfaceStore';
import { BlockType } from '../utils/blockUtils';

type MutatorProps = {
  block: BlockType;
  vertex: {
    index: number;
    position: Vector3;
  };
  geometry?: BufferGeometry;
};

const Mutator = ({ block, vertex }: MutatorProps) => {
  const { setBlockHovered } = useInterfaceStore();
  const { setBlocks } = useWorldStore();
  const sphereRef = useRef<Mesh | null>(null);
  const [mutation, setMutation] = useState<'add' | 'remove' | 'reset'>('reset');
  const [initialY, setInitialY] = useState<number | null>(null);
  const { addition, removal, reset } = useMutation(vertex.index, block);

  // useEffect(() => {
  //   console.log('🚀 ~ file: Mutator.tsx ~ line 28 ~ addition, removal, reset', addition, removal, reset);
  // }, [addition, removal, reset]);

  useFrame(({ mouse }) => {
    if (initialY === null) {
      setInitialY(mouse.y);
    } else {
      if (mouse.y - initialY > 0.125) {
        setMutation('add');
      } else if (mouse.y - initialY < -0.125) {
        setMutation('remove');
      } else {
        setMutation('reset');
      }
    }
  });

  useEffect(() => {
    if (mutation === 'add') {
      if (sphereRef.current) {
        sphereRef.current.position.y = vertex.position.y + blockSize.y;
      }

      setBlocks(addition);
      setBlockHovered(null);

      return;
    }

    if (mutation === 'remove') {
      if (sphereRef.current) {
        sphereRef.current.position.y = vertex.position.y - blockSize.y;
      }

      setBlocks(removal);
      setBlockHovered(null);
      return;
    }

    if (mutation === 'reset') {
      if (sphereRef.current) {
        sphereRef.current.position.y = vertex.position.y;
      }

      setBlocks(reset);
      setBlockHovered(null);
      return;
    }
  }, [mutation]);

  return (
    <group>
      <group position={block.worldPosition}>
        <Sphere ref={sphereRef} position={vertex.position} args={[1]}>
          <meshBasicMaterial color="#000" />
        </Sphere>
      </group>
    </group>
  );
};

export default Mutator;
