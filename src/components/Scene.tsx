import { Canvas } from '@react-three/fiber';
import { OrthographicCamera as Camera } from '@react-three/drei';
import { useTrack } from 'core/Track/hooks';
import { useEffect } from 'react';
import { OrthographicCamera } from 'three';
import { Box } from '@react-three/drei';
import Controls from './Controls';
import Lighting from './Lighting';
import Track from './Track';
import SceneInterface from './UserInterface/SceneInterface';
import World from './World';
import { interactionGroups, Physics, RigidBody, RigidBodyApi, Debug } from '@react-three/rapier';
import PostProcessing from './PostProcessing';

function Scene() {
  // const camera = new OrthographicCamera();
  // camera.position.set(-256, 256, 256);
  // camera.zoom = 8;
  // camera.rotation.set(-30 * (Math.PI / 180), -Math.PI / 4, 0, 'YXZ');
  // camera.near = 0.1;
  // camera.far = 1000;

  return (
    <Canvas gl={{ antialias: false }} dpr={2} shadows>
      <Camera
        makeDefault
        position={[-256, 256, 256]}
        zoom={8}
        rotation={[-30 * (Math.PI / 180), -Math.PI / 4, 0, 'YXZ']}
        near={0.1}
        far={1000}
      />
      <Lighting />
      <Controls />
      <Physics colliders={false} paused={true}>
        <World />
        <Track />
        <SceneInterface />
      </Physics>
    </Canvas>
  );
}

export default Scene;
