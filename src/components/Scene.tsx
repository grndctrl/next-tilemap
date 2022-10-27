import { Box, OrbitControls, Sphere } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Lighting from './Lighting';
import PostProcessing from './PostProcessing';

import { useWorldStore } from '../utils/worldStore';
import Chunk from './Chunk';
import SceneInterface from './UserInterface/SceneInterface';
import Controls from './Controls';
import { useEffect } from 'react';
import { OrthographicCamera } from 'three';
import { useControls } from 'leva';
import { Physics, Debug, RigidBody } from '@react-three/rapier';
import { colors } from '../utils/tailwindDefaults';

function Scene() {
  const { chunks, exportJSON } = useWorldStore();

  const camera = new OrthographicCamera();
  camera.position.set(-100, 100, 100);
  camera.zoom = 8;
  camera.rotation.set(-30 * (Math.PI / 180), -Math.PI / 4, 0, 'YXZ');
  camera.near = 0.1;
  camera.far = 1000;

  return (
    <Canvas gl={{ antialias: false }} dpr={2} camera={camera}>
      <Lighting />
      <Controls />
      <SceneInterface />

      <Physics colliders={false} paused={true}>
        {chunks.map((chunk) => (
          <Chunk index={chunk.index} worldPosition={chunk.origin} blocks={chunk.blocks} key={`chunk-${chunk.index}}`} />
        ))}
      </Physics>
      {/* <PostProcessing /> */}
    </Canvas>
  );
}

export default Scene;
