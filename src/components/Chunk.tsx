import { interactionGroups, RigidBody } from '@react-three/rapier';
import GrassMaterial from 'assets/materials/Grass';
import { useWorld } from 'core/World';
import { forwardRef, memo, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { BufferGeometry, Mesh, Object3D, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { useSceneStore } from 'utils/sceneStore';
import { generateBlockGeometry, getNeighbourVerticesForNeighboursInBlocks } from '../utils/blockUtils';
import { useInterfaceStore } from '../utils/interfaceStore';

type ChunkProps = {
  index: number;
  worldPosition: Vector3;
  blocks: number[];
};

type ChunkType = {
  index: number;
  worldPosition: Vector3;
  blocks: number[];
};

// const getNeighbourVerticesForNeighboursInBlocks = (neighbours: (BlockType | null)[]): boolean[] => {
//   const currentNeighbourVertices: boolean[] = [];

//   // left 0 2 4 6 8
//   if (neighbours[0]) {
//     currentNeighbourVertices.push(
//       neighbours[0].vertices[1],
//       neighbours[0].vertices[3],
//       neighbours[0].vertices[5],
//       neighbours[0].vertices[7],
//       neighbours[0].vertices[9],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   // right 3 1 7 5 9
//   if (neighbours[1]) {
//     currentNeighbourVertices.push(
//       neighbours[1].vertices[2],
//       neighbours[1].vertices[0],
//       neighbours[1].vertices[6],
//       neighbours[1].vertices[4],
//       neighbours[1].vertices[8],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   // back 1 0 5 4 10
//   if (neighbours[2]) {
//     currentNeighbourVertices.push(
//       neighbours[2].vertices[3],
//       neighbours[2].vertices[2],
//       neighbours[2].vertices[7],
//       neighbours[2].vertices[6],
//       neighbours[2].vertices[11],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   // front 2 3 6 7 11
//   if (neighbours[3]) {
//     currentNeighbourVertices.push(
//       neighbours[3].vertices[0],
//       neighbours[3].vertices[1],
//       neighbours[3].vertices[4],
//       neighbours[3].vertices[5],
//       neighbours[3].vertices[10],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   // bottom 2 3 0 1 12
//   if (neighbours[4]) {
//     currentNeighbourVertices.push(
//       neighbours[4].vertices[6],
//       neighbours[4].vertices[7],
//       neighbours[4].vertices[4],
//       neighbours[4].vertices[5],
//       neighbours[4].vertices[13],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   // top 6 7 4 5 13
//   if (neighbours[5]) {
//     currentNeighbourVertices.push(
//       neighbours[5].vertices[2],
//       neighbours[5].vertices[3],
//       neighbours[5].vertices[0],
//       neighbours[5].vertices[1],
//       neighbours[5].vertices[12],
//     );
//   } else {
//     currentNeighbourVertices.push(false, false, false, false, false);
//   }

//   return currentNeighbourVertices;
// };

export type ChunkRef = {
  mesh: RefObject<Mesh>;
};

const Chunk = forwardRef<Mesh, ChunkProps>(({ index, worldPosition, blocks }, ref) => {
  const [blockGeometries, setBlockGeometries] = useState<(BufferGeometry | null)[]>([]);

  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const mesh = useRef<Mesh>(null);

  const setBlockHovered = useInterfaceStore((state) => state.setBlockHovered);
  const setChunkGeometry = useSceneStore((state) => state.setChunkGeometry);
  const { getBlock, chunkRenderKeys } = useWorld();
  const renderKey = chunkRenderKeys[index];

  const generateChunkGeometry = useCallback(
    (blocks: number[]) => {
      const geometries: BufferGeometry[] = [];

      blocks.forEach((blockIndex, index) => {
        const block = getBlock(blockIndex);
        if (block) {
          let blockGeometry: BufferGeometry | null = null;

          if (block.isActive) {
            blockGeometry = blockGeometries[index];
          }

          if (blockGeometry) {
            const object = new Object3D();

            object.position.set(block.localPosition.x, block.localPosition.y, block.localPosition.z);
            object.updateMatrix();

            geometries.push(blockGeometry.clone().applyMatrix4(object.matrix));
          }
        }
      });

      if (geometries.length > 0) {
        let mergedGeometry = mergeBufferGeometries(geometries);

        return mergedGeometry;
      }

      return null;
    },
    [blockGeometries, getBlock],
  );

  useEffect(() => {
    const geometries = blocks.map((blockIndex) => {
      const block = getBlock(blockIndex);

      if (block) {
        const neighbourBlocks = block.neighbours.map((neighbour) => (neighbour > -1 ? getBlock(neighbour) : null));
        const neighbourVertices: boolean[] = getNeighbourVerticesForNeighboursInBlocks(neighbourBlocks);

        return generateBlockGeometry(block.id, block.vertices, neighbourVertices);
      }
      return null;
    });

    const generatedBlockGeometries = geometries.map((geometry) => (geometry ? geometry.blockGeometry : null));

    setBlockGeometries(generatedBlockGeometries);
  }, [blocks, getBlock, renderKey]);

  useEffect(() => {
    const chunkGeometry = generateChunkGeometry(blocks);

    if (chunkGeometry) {
      chunkGeometry.computeBoundingBox();
      setGeometry(chunkGeometry);
      // setChunkGeometry(chunkGeometry, index);
    }
  }, [blocks, generateChunkGeometry, setChunkGeometry, index]);

  useEffect(() => {
    console.log('tick');
    if (geometry) {
      setChunkGeometry(geometry, index);
    }
  }, [geometry, index, setChunkGeometry]);

  return (
    <group position={worldPosition}>
      {geometry && (
        <RigidBody type="fixed" colliders="trimesh">
          <mesh ref={ref} geometry={geometry} receiveShadow castShadow>
            <GrassMaterial />
          </mesh>
        </RigidBody>
      )}
    </group>
  );
});

Chunk.displayName = 'Chunk';

export default memo(Chunk);
