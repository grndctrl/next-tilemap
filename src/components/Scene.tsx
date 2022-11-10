import { Canvas } from '@react-three/fiber';
import Lighting from './Lighting';
import { OrthographicCamera } from 'three';
import Controls from './Controls';
import SceneInterface from './UserInterface/SceneInterface';
import World from './World';
import TrackBlock from './TrackBlock';

function Scene() {
  const camera = new OrthographicCamera();
  camera.position.set(-256, 256, 256);
  camera.zoom = 8;
  camera.rotation.set(-30 * (Math.PI / 180), -Math.PI / 4, 0, 'YXZ');
  camera.near = 0.1;
  camera.far = 1000;

  return (
    <Canvas gl={{ antialias: false }} dpr={2} camera={camera}>
      <Lighting />
      <Controls />
      <SceneInterface />
      <World />
      <TrackBlock />
    </Canvas>
  );
}

export default Scene;
