import * as THREE from 'three';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { Box3, Mesh } from 'three';

type GLTFResult = GLTF & {
  nodes: {
    Arrow: THREE.Mesh;
  };
};

const Arrow = forwardRef<Box3[], JSX.IntrinsicElements['group']>((props, ref) => {
  const { nodes } = useGLTF('/models/arrow.glb') as unknown as GLTFResult;
  const meshRef = useRef<Mesh | null>(null);

  useImperativeHandle(
    ref,
    () => {
      const boundingBoxes: Box3[] = [];

      if (meshRef.current) {
        meshRef.current.geometry.computeBoundingBox();

        if (meshRef.current.geometry.boundingBox) {
          boundingBoxes.push(meshRef.current.geometry.boundingBox);

          console.log(boundingBoxes);
        }
      }

      return boundingBoxes;
    },
    [],
  );

  return (
    <group {...props} dispose={null}>
      <mesh ref={meshRef} geometry={nodes.Arrow.geometry}>
        <meshStandardMaterial />
      </mesh>
    </group>
  );
});

Arrow.displayName = 'Arrow';

useGLTF.preload('/models/arrow.glb');

export default Arrow;
