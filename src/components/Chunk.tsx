import { ThreeEvent, useFrame } from '@react-three/fiber';
import { remove } from 'lodash';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, Intersection, Mesh, Object3D, Raycaster, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import {
  BlockType,
  blockVertexTable,
  calcTableIndex,
  geometryFromTriangles,
  getSideTriangles,
  getTopTriangles,
} from '../utils/blockUtils';
import { getMeasurements } from '../utils/chunkUtils';
import { useInterfaceStore } from '../utils/interfaceStore';
import { useWorldStore } from '../utils/worldStore';

type ChunkProps = {
  index: number;
  worldPosition: Vector3;
  blocks: number[];
};

export type ChunkType = {
  index: number;
  worldPosition: Vector3;
  blocks: number[];
};

const getNeighbourVerticesForNeighboursInBlocks = (neighbours: (BlockType | null)[]): boolean[] => {
  const currentNeighbourVertices: boolean[] = [];

  // left 0 2 4 6 8
  if (neighbours[0]) {
    currentNeighbourVertices.push(
      neighbours[0].vertices[1],
      neighbours[0].vertices[3],
      neighbours[0].vertices[5],
      neighbours[0].vertices[7],
      neighbours[0].vertices[9]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // right 3 1 7 5 9
  if (neighbours[1]) {
    currentNeighbourVertices.push(
      neighbours[1].vertices[2],
      neighbours[1].vertices[0],
      neighbours[1].vertices[6],
      neighbours[1].vertices[4],
      neighbours[1].vertices[8]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // back 1 0 5 4 10
  if (neighbours[2]) {
    currentNeighbourVertices.push(
      neighbours[2].vertices[3],
      neighbours[2].vertices[2],
      neighbours[2].vertices[7],
      neighbours[2].vertices[6],
      neighbours[2].vertices[11]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // front 2 3 6 7 11
  if (neighbours[3]) {
    currentNeighbourVertices.push(
      neighbours[3].vertices[0],
      neighbours[3].vertices[1],
      neighbours[3].vertices[4],
      neighbours[3].vertices[5],
      neighbours[3].vertices[10]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // bottom 2 3 0 1 12
  if (neighbours[4]) {
    currentNeighbourVertices.push(
      neighbours[4].vertices[6],
      neighbours[4].vertices[7],
      neighbours[4].vertices[4],
      neighbours[4].vertices[5],
      neighbours[4].vertices[13]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // top 6 7 4 5 13
  if (neighbours[5]) {
    currentNeighbourVertices.push(
      neighbours[5].vertices[2],
      neighbours[5].vertices[3],
      neighbours[5].vertices[0],
      neighbours[5].vertices[1],
      neighbours[5].vertices[12]
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  return currentNeighbourVertices;
};

const Chunk = ({ index, worldPosition, blocks }: ChunkProps) => {
  const [blockGeometries, setBlockGeometries] = useState<(BufferGeometry | null)[]>([]);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const mesh = useRef<Mesh | null>(null);
  const { setBlockHovered, blockHovered } = useInterfaceStore();
  const { getBlock, setBlock, chunkRenderKeys } = useWorldStore();
  const { blockSize } = getMeasurements();
  const renderKey = chunkRenderKeys[index];

  const generateBlockGeometry = useCallback(
    ({ id, neighbours, vertices }: BlockType) => {
      const neighbourBlocks = neighbours.map((neighbour) => (neighbour > -1 ? getBlock(neighbour) : null));
      const neighbourVertices: boolean[] = getNeighbourVerticesForNeighboursInBlocks(neighbourBlocks);

      const topTriangles = getTopTriangles(vertices, [
        neighbourVertices[25],
        neighbourVertices[26],
        neighbourVertices[27],
        neighbourVertices[28],
        neighbourVertices[29],
      ]);

      if (topTriangles) {
        const leftTriangles = getSideTriangles(
          [0, 2, 4, 6, 8],
          [vertices[0], vertices[2], vertices[4], vertices[6], vertices[8]],
          [neighbourVertices[0], neighbourVertices[1], neighbourVertices[2], neighbourVertices[3], neighbourVertices[4]]
        );

        const rightTriangles = getSideTriangles(
          [3, 1, 7, 5, 9],
          [vertices[3], vertices[1], vertices[7], vertices[5], vertices[9]],
          [neighbourVertices[5], neighbourVertices[6], neighbourVertices[7], neighbourVertices[8], neighbourVertices[9]]
        );

        const backTriangles = getSideTriangles(
          [1, 0, 5, 4, 10],
          [vertices[1], vertices[0], vertices[5], vertices[4], vertices[10]],
          [
            neighbourVertices[10],
            neighbourVertices[11],
            neighbourVertices[12],
            neighbourVertices[13],
            neighbourVertices[14],
          ]
        );

        const frontTriangles = getSideTriangles(
          [2, 3, 6, 7, 11],
          [vertices[2], vertices[3], vertices[6], vertices[7], vertices[11]],
          [
            neighbourVertices[15],
            neighbourVertices[16],
            neighbourVertices[17],
            neighbourVertices[18],
            neighbourVertices[19],
          ]
        );

        const triangles = topTriangles
          .concat(leftTriangles)
          .concat(rightTriangles)
          .concat(backTriangles)
          .concat(frontTriangles);

        if (triangles.length > 0) {
          const blockGeometry = geometryFromTriangles(triangles);

          if (blockGeometry) {
            // TODO: does this need to be that long / every position?
            const idArray = new Int32Array(
              Array.from({ length: blockGeometry.getAttribute('position').array.length / 3 }).map(() => id)
            );
            const idAttribute = new BufferAttribute(idArray, 1);
            blockGeometry.setAttribute('id', idAttribute);

            return blockGeometry;
          }
        }
      }

      return null;
    },
    [getBlock]
  );

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
        return mergeBufferGeometries(geometries);
      }

      return null;
    },
    [blockGeometries, getBlock]
  );

  useEffect(() => {
    const geometries = blocks.map((blockIndex) => {
      const block = getBlock(blockIndex);
      if (block) {
        return generateBlockGeometry(block);
      }
      return null;
    });
    setBlockGeometries(geometries);
  }, [blocks, generateBlockGeometry, getBlock, renderKey]);

  useEffect(() => {
    const ChunkGeometry = generateChunkGeometry(blocks);
    setGeometry(ChunkGeometry);
  }, [blocks, generateChunkGeometry]);

  const raycaster = new Raycaster();
  useFrame(({ camera, mouse }) => {
    if (mesh.current) {
      raycaster.setFromCamera(mouse, camera);

      const intersections = raycaster.intersectObject(mesh.current);
      if (intersections.length > 0) {
        handleIntersection(intersections[0]);
      }
    }
  });

  const handleIntersection = ({ face, object, point }: Intersection) => {
    const { geometry } = object as Mesh;
    const idBufferAttribute = geometry.getAttribute('id');

    if (face) {
      const id = idBufferAttribute.array[face.a];
      const block = getBlock(id);

      if (block) {
        console.log('🚀 ~ file: Chunk.tsx ~ line 271 ~ calcTableIndex(block.vertices)', calcTableIndex(block.vertices));
        // const geometry = blockGeometries[block.index];

        point.sub(block.worldPosition);

        const vertices = blockVertexTable.slice(0, 8).map((position, index) => ({ index, position }));

        remove(vertices, ({ index }) => !block.vertices[index]);
        remove(vertices, ({ index }) => {
          if (index < 4) {
            return vertices.findIndex(({ index: _index }) => _index === index + 4) > -1;
          }
          return false;
        });

        vertices.sort((a, b) => point.distanceTo(a.position) - point.distanceTo(b.position));
        const hoveredVertex = vertices[0];

        const blockAbove = getBlock(block.worldPosition.clone().add(new Vector3(0, blockSize.y, 0)));

        if (blockAbove?.isActive) {
          // if there is a block above, skip current block
          // however there are some exceptions where the current block is still visible as top level
          let isSkipped = true;

          if (calcTableIndex(blockAbove.vertices) === 6798) {
            if (calcTableIndex(block.vertices) === 16367) {
              isSkipped = false;
            } else if (calcTableIndex(block.vertices) === 16383) {
              if (hoveredVertex.index === 4 || hoveredVertex.index === 5 || hoveredVertex.index === 6) {
                isSkipped = false;
              }
            }
          } else if (calcTableIndex(blockAbove.vertices) === 6477) {
            if (calcTableIndex(block.vertices) === 16351) {
              isSkipped = false;
            } else if (calcTableIndex(block.vertices) === 16383) {
              if (hoveredVertex.index === 4 || hoveredVertex.index === 5 || hoveredVertex.index === 7) {
                isSkipped = false;
              }
            }
          } else if (calcTableIndex(blockAbove.vertices) === 5675) {
            if (calcTableIndex(block.vertices) === 16319) {
              isSkipped = false;
            } else if (calcTableIndex(block.vertices) === 16383) {
              if (hoveredVertex.index === 4 || hoveredVertex.index === 6 || hoveredVertex.index === 7) {
                isSkipped = false;
              }
            }
          } else if (calcTableIndex(blockAbove.vertices) === 5399) {
            if (calcTableIndex(block.vertices) === 16255) {
              isSkipped = false;
            } else if (calcTableIndex(block.vertices) === 16383) {
              if (hoveredVertex.index === 5 || hoveredVertex.index === 6 || hoveredVertex.index === 7) {
                isSkipped = false;
              }
            }
          }

          if (isSkipped) {
            return null;
          }
        }

        const neighbourBlocks = block.neighbours.map((neighbour) => (neighbour > -1 ? getBlock(neighbour) : null));
        const neighbourVertices: boolean[] = getNeighbourVerticesForNeighboursInBlocks(neighbourBlocks);

        const topTriangles = getTopTriangles(block.vertices, [
          neighbourVertices[25],
          neighbourVertices[26],
          neighbourVertices[27],
          neighbourVertices[28],
          neighbourVertices[29],
        ]);

        if (topTriangles) {
          const geometry = geometryFromTriangles(topTriangles);
          if (geometry) {
            setBlockHovered({
              block,
              vertex: hoveredVertex,
              geometry,
            });
          }
        }
      }
    }
  };

  const handlePointerLeave = () => {
    setBlockHovered(null);
  };

  return (
    <group position={worldPosition}>
      {geometry && (
        <>
          <mesh ref={mesh} geometry={geometry} onPointerLeave={handlePointerLeave}>
            <meshStandardMaterial color="#2dd4bf" />
          </mesh>
        </>
      )}
    </group>
  );
};

export default memo(Chunk);
