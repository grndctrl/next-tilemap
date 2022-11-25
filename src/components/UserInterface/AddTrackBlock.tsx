import { Box } from '@react-three/drei';
import {
  RigidBody,
  useRapier,
  RigidBodyApi,
  MeshCollider,
  IntersectionEnterHandler,
  IntersectionExitHandler,
  interactionGroups,
  CuboidCollider,
} from '@react-three/rapier';
import Arrow from 'models/Arrow';
import { useEffect, useRef } from 'react';
import { Box3, BufferGeometry, Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';
import { blockSize } from 'utils/constants';

type AddTrackBlockProps = {
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
};

const AddTrackBlock = ({ blockHovered, neighbours }: AddTrackBlockProps) => {
  const position = blockHovered.block.worldPosition
    .clone()
    .add(new Vector3(blockHovered.vertex.position.x, blockSize.y + 1, blockHovered.vertex.position.z));

  const boundingBoxes = useRef<Box3[]>([]);

  useEffect(() => {
    console.log('boundingBoxes', boundingBoxes);
  }, []);

  return (
    <group position={position}>
      <Arrow ref={boundingBoxes} />
    </group>
  );
};

export default AddTrackBlock;
