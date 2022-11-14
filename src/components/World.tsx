import { useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { remove } from "lodash";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, Intersection, Mesh, Raycaster, Vector3 } from "three";
import {
  blockVertexTable,
  calcTableIndex,
  geometryFromTriangles,
  getTopTriangles,
} from "../utils/blockUtils";
import {
  calcArrayPositionFromWorldPosition,
  calcWorldIndexFromWorldPosition,
} from "../utils/chunkUtils";
import { useInterfaceStore } from "../utils/interfaceStore";
import { useWorld } from "core/World";
import { blockSize } from "../utils/constants";
import Chunk, { ChunkRef } from "./Chunk";

const World = () => {
  const { chunks, getBlock, measurements } = useWorld();
  const chunkRefs = useRef<(Mesh | null)[]>(
    Array.from({ length: chunks.length }).map(() => null)
  );
  const raycaster = new Raycaster();
  const { setBlockHovered, blockHovered } = useInterfaceStore();

  const handleIntersection = ({ face, object, point }: Intersection) => {
    if (!face) return;

    const mesh = object as Mesh;
    const idBufferAttribute = mesh.geometry.getAttribute("id");
    const id = idBufferAttribute.array[face.a];
    const block = getBlock(id);

    if (!block) return;

    if (id !== blockHovered?.block.id) {
      const p = calcArrayPositionFromWorldPosition(
        block.worldPosition,
        measurements.blocksInWorld
      );
    }

    point.sub(block.worldPosition);

    const vertices = blockVertexTable
      .slice(0, 8)
      .map((position, index) => ({ index, position }));

    remove(vertices, ({ index }) => !block.vertices[index]);
    remove(vertices, ({ index }) => {
      if (index < 4) {
        return (
          vertices.findIndex(({ index: _index }) => _index === index + 4) > -1
        );
      }
      return false;
    });

    vertices.sort(
      (a, b) => point.distanceTo(a.position) - point.distanceTo(b.position)
    );
    const hoveredVertex = vertices[0];

    const blockAbove = getBlock(
      block.worldPosition.clone().add(new Vector3(0, blockSize.y, 0))
    );

    if (blockAbove?.isActive) {
      // if there is a block above, skip current block
      // however there are some exceptions where the current block is still visible as top level
      let isSkipped = true;

      if (calcTableIndex(blockAbove.vertices) === 6798) {
        if (calcTableIndex(block.vertices) === 16367) {
          isSkipped = false;
        } else if (calcTableIndex(block.vertices) === 16383) {
          if (
            hoveredVertex.index === 4 ||
            hoveredVertex.index === 5 ||
            hoveredVertex.index === 6
          ) {
            isSkipped = false;
          }
        }
      } else if (calcTableIndex(blockAbove.vertices) === 6477) {
        if (calcTableIndex(block.vertices) === 16351) {
          isSkipped = false;
        } else if (calcTableIndex(block.vertices) === 16383) {
          if (
            hoveredVertex.index === 4 ||
            hoveredVertex.index === 5 ||
            hoveredVertex.index === 7
          ) {
            isSkipped = false;
          }
        }
      } else if (calcTableIndex(blockAbove.vertices) === 5675) {
        if (calcTableIndex(block.vertices) === 16319) {
          isSkipped = false;
        } else if (calcTableIndex(block.vertices) === 16383) {
          if (
            hoveredVertex.index === 4 ||
            hoveredVertex.index === 6 ||
            hoveredVertex.index === 7
          ) {
            isSkipped = false;
          }
        }
      } else if (calcTableIndex(blockAbove.vertices) === 5399) {
        if (calcTableIndex(block.vertices) === 16255) {
          isSkipped = false;
        } else if (calcTableIndex(block.vertices) === 16383) {
          if (
            hoveredVertex.index === 5 ||
            hoveredVertex.index === 6 ||
            hoveredVertex.index === 7
          ) {
            isSkipped = false;
          }
        }
      }

      if (isSkipped) {
        return null;
      }
    }

    // const geometry = hoverGeometries[block.index];
    const topTriangles = getTopTriangles(
      block.vertices,
      Array.from({ length: 30 }).map(() => false)
    );
    if (!topTriangles) return null;

    const geometry = geometryFromTriangles(topTriangles);

    if (geometry) {
      setBlockHovered({
        block,
        vertex: hoveredVertex,
        geometry,
      });
    }
  };

  useFrame(({ mouse, camera }) => {
    raycaster.setFromCamera(mouse, camera);

    const meshes: Mesh[] = [];
    chunkRefs.current.forEach((mesh) => {
      if (mesh) {
        meshes.push(mesh);
      }
    });

    const intersections = raycaster.intersectObjects(meshes);
    if (intersections.length > 0) {
      handleIntersection(intersections[0]);
    } else {
      setBlockHovered(null);
    }
  });

  useEffect(() => {
    console.log("🚀 ~ measurements", measurements);
  }, []);

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
