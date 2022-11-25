import { useFrame } from '@react-three/fiber';
import { useWorld } from 'core/World';
import { remove } from 'lodash';
import { useEffect, useRef } from 'react';
import { BufferGeometry, Intersection, Mesh, Object3D, Raycaster, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { BlockType, blockVertexTable, calcTableIndex, getTopGeometry } from '../utils/blockUtils';
import { calcArrayPositionFromWorldPosition } from '../utils/chunkUtils';
import { blockSize } from '../utils/constants';
import { useInterfaceStore } from '../utils/interfaceStore';
import Chunk from './Chunk';

type WorldProps = {
  isSkippingInteraction?: boolean;
};

const World = ({ isSkippingInteraction = false }: WorldProps) => {
  const { chunks, getBlock, measurements } = useWorld();
  const chunkRefs = useRef<(Mesh | null)[]>(Array.from({ length: chunks.length }).map(() => null));
  const raycaster = new Raycaster();

  const setBlockHovered = useInterfaceStore((state) => state.setBlockHovered);
  const setBlocksHovered = useInterfaceStore((state) => state.setBlocksHovered);
  const blockHovered = useInterfaceStore((state) => state.blockHovered);

  const handleIntersectionQuad = ({ face, object, point }: Intersection) => {
    if (!face) return;

    const mesh = object as Mesh;
    const idBufferAttribute = mesh.geometry.getAttribute('id');
    const id = idBufferAttribute.array[face.a];
    const block = getBlock(id);

    if (!block) return;

    // determine closest vertex to intersection
    const vertices = blockVertexTable.slice(0, 8).map((position, index) => ({ index, position }));
    point.sub(block.worldPosition);

    remove(vertices, ({ index }) => !block.vertices[index]);
    remove(vertices, ({ index }) => {
      if (index < 4) {
        return vertices.findIndex(({ index: _index }) => _index === index + 4) > -1;
      }
      return false;
    });

    vertices.sort((a, b) => point.distanceTo(a.position) - point.distanceTo(b.position));
    const hoveredVertex = vertices[0];

    const geometry = getTopGeometry(
      block.vertices,
      Array.from({ length: 30 }).map(() => false),
    );

    if (!geometry) return;

    // get neighbouring blocks
    const neighbourPositions: Vector3[] = [];
    if (hoveredVertex.index === 0 || hoveredVertex.index === 4) {
      neighbourPositions.push(
        new Vector3(-1, 0, -1).multiply(blockSize),
        new Vector3(0, 0, -1).multiply(blockSize),
        new Vector3(-1, 0, 0).multiply(blockSize),
      );
    } else if (hoveredVertex.index === 1 || hoveredVertex.index === 5) {
      neighbourPositions.push(
        new Vector3(0, 0, -1).multiply(blockSize),
        new Vector3(1, 0, -1).multiply(blockSize),
        new Vector3(1, 0, 0).multiply(blockSize),
      );
    } else if (hoveredVertex.index === 2 || hoveredVertex.index === 6) {
      neighbourPositions.push(
        new Vector3(-1, 0, 0).multiply(blockSize),
        new Vector3(-1, 0, 1).multiply(blockSize),
        new Vector3(0, 0, 1).multiply(blockSize),
      );
    } else if (hoveredVertex.index === 3 || hoveredVertex.index === 7) {
      neighbourPositions.push(
        new Vector3(1, 0, 0).multiply(blockSize),
        new Vector3(0, 0, 1).multiply(blockSize),
        new Vector3(1, 0, 1).multiply(blockSize),
      );
    }

    const neighbourBlocks: { block: BlockType; position: Vector3; geometry: BufferGeometry }[] = [];
    neighbourPositions.forEach((position) => {
      const worldPosition = position.clone().add(block.worldPosition);
      const neighbour = getBlock(worldPosition);
      if (neighbour) {
        const geometry = getTopGeometry(
          neighbour.vertices,
          Array.from({ length: 30 }).map(() => false),
        );
        if (geometry) {
          neighbourBlocks.push({ block: neighbour, position, geometry });
        }
      }
    });

    setBlocksHovered({
      blockHovered: {
        block,
        vertex: hoveredVertex,
        geometry,
      },
      neighbours: neighbourBlocks.map((block) => block),
    });
  };

  useFrame(({ mouse, camera }) => {
    if (isSkippingInteraction || !camera) return;

    raycaster.setFromCamera(mouse, camera);

    const meshes: Mesh[] = [];
    chunkRefs.current.forEach((mesh) => {
      if (mesh) {
        meshes.push(mesh);
      }
    });

    const intersections = raycaster.intersectObjects(meshes);
    if (intersections.length > 0) {
      handleIntersectionQuad(intersections[0]);
    } else {
      setBlockHovered(null);
      setBlocksHovered(null);
    }
  });

  return (
    <group>
      {chunks.map((chunk, index) => (
        <Chunk
          ref={(ref) => {
            chunkRefs.current[index] = ref;
          }}
          index={chunk.index}
          worldPosition={chunk.origin}
          blocks={chunk.blocks}
          key={`chunk-${chunk.index}}`}
        />
      ))}
    </group>
  );
};

export default World;
