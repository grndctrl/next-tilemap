/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh;
  };
  materials: {
    Material: THREE.MeshStandardMaterial;
  };
};

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/hovercar.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <axesHelper position={[0, 2, 0]} />
      <mesh castShadow geometry={nodes.Cube.geometry}>
        <meshStandardMaterial color={'cyan'} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/hovercar.glb');