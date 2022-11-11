/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { TrackAngle, TrackVariation } from 'core/Track';

type GLTFResult = GLTF & {
  nodes: {
    RoadForward: THREE.Mesh;
    RoadTurnLeft: THREE.Mesh;
    RoadForwardDownward: THREE.Mesh;
    RoadForwardUpward: THREE.Mesh;
    RoadTurnRight: THREE.Mesh;
  };
  materials: {};
};

type TrackModelProps = JSX.IntrinsicElements['group'] & {
  variation: TrackVariation;
  angle: TrackAngle;
  color?: 'white' | 'orange';
};

export function TrackModel({ variation, angle, color = 'white', ...props }: TrackModelProps) {
  // @ts-ignore
  const { nodes, materials } = useGLTF('/roads.glb') as GLTFResult;

  return (
    <group {...props} dispose={null} scale={10}>
      {variation === TrackVariation.FORWARD && angle === TrackAngle.STRAIGHT && (
        <mesh castShadow receiveShadow geometry={nodes.RoadForward.geometry} material={nodes.RoadForward.material}>
          <meshStandardMaterial color={color === 'orange' ? '#f97316' : color} />
        </mesh>
      )}
      {variation === TrackVariation.TURN_LEFT && angle === TrackAngle.STRAIGHT && (
        <mesh castShadow receiveShadow geometry={nodes.RoadTurnLeft.geometry} material={nodes.RoadTurnLeft.material}>
          <meshStandardMaterial color={color === 'orange' ? '#f97316' : color} />
        </mesh>
      )}
      {variation === TrackVariation.FORWARD && angle === TrackAngle.DOWN && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RoadForwardDownward.geometry}
          material={nodes.RoadForwardDownward.material}
        >
          <meshStandardMaterial color={color === 'orange' ? '#f97316' : color} />
        </mesh>
      )}
      {variation === TrackVariation.FORWARD && angle === TrackAngle.UP && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RoadForwardUpward.geometry}
          material={nodes.RoadForwardUpward.material}
        >
          <meshStandardMaterial color={color === 'orange' ? '#f97316' : color} />
        </mesh>
      )}
      {variation === TrackVariation.TURN_RIGHT && angle === TrackAngle.STRAIGHT && (
        <mesh castShadow receiveShadow geometry={nodes.RoadTurnRight.geometry} material={nodes.RoadTurnRight.material}>
          <meshStandardMaterial color={color === 'orange' ? '#f97316' : color} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload('/roads.glb');
