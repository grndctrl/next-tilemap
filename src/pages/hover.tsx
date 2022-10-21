import { Box, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { interactionGroups, Physics, RigidBody, RigidBodyApi } from '@react-three/rapier';
import type { NextPage } from 'next';
import { Perf } from 'r3f-perf';
import { RefObject } from 'react';
import { Quaternion, Vector3 } from 'three';
import Player from '../components/Player';

export const useFollowingCamera = (target: RefObject<RigidBodyApi>) => {
  const { camera, clock } = useThree();
  const offset = new Vector3(0, 10, -40);
  const lookAhead = new Vector3(0, 10, 40);

  useFrame(() => {
    if (!target.current) return null;

    const t = 0.1;

    const rotation = target.current.rotation();
    const translation = target.current.translation();

    const forwardVector = new Vector3(0, 0, 1)
      .applyQuaternion(rotation)
      .projectOnPlane(new Vector3(0, 1, 0))
      .normalize();
    const correctedRotation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), forwardVector);

    const position = offset.clone().applyQuaternion(correctedRotation).add(translation);
    const lookAt = lookAhead.clone().applyQuaternion(correctedRotation).add(translation);

    camera.position.lerp(position, t);
    camera.lookAt(lookAt);
  });
};

const Ground = () => {
  return (
    <RigidBody position={[0, 0, 0]} colliders="cuboid" type="fixed" collisionGroups={interactionGroups(1, [0, 1])}>
      <Box receiveShadow args={[150, 0.1, 100]} position={[0, 0, 0]}>
        <meshStandardMaterial color={'#444'} />
      </Box>
      <Box receiveShadow args={[150, 0.1, 50]} position={[0, 5, -50]} rotation={[Math.PI * 0.1, 0, 0]}>
        <meshStandardMaterial color={'#444'} />
      </Box>
      <Box receiveShadow args={[150, 0.1, 50]} position={[0, 5, 50]} rotation={[Math.PI * -0.1, 0, 0]}>
        <meshStandardMaterial color={'#444'} />
      </Box>
      <Box receiveShadow args={[50, 0.1, 150]} position={[-50, 5, 0]} rotation={[0, 0, Math.PI * -0.1]}>
        <meshStandardMaterial color={'#444'} />
      </Box>
      <Box receiveShadow args={[50, 0.1, 150]} position={[50, 5, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <meshStandardMaterial color={'#444'} />
      </Box>
    </RigidBody>
  );
};

const Crate = ({ position }: { position: Vector3 }) => {
  return (
    <RigidBody position={position} type="dynamic" colliders="cuboid" mass={1}>
      <Box args={[4, 4, 4]} castShadow>
        <meshStandardMaterial color={'#742'} />
      </Box>
    </RigidBody>
  );
};

const Page: NextPage = () => {
  return (
    <div className="fixed w-full h-screen">
      <Canvas
        dpr={1}
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 500,
          position: [2.5, 4, 6],
        }}
      >
        <color args={['black']} attach={'background'} />
        {/* <OrbitControls minDistance={10} /> */}
        <Perf position="bottom-right" />
        <directionalLight
          castShadow
          position={[4, 4, 1]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={100}
          shadow-camera-top={100}
          shadow-camera-right={100}
          shadow-camera-bottom={-100}
          shadow-camera-left={-100}
        />
        <ambientLight intensity={0.5} />
        <Physics timeStep={'vary'}>
          {/* <Debug /> */}
          <Player />
          <Ground />

          <Crate position={new Vector3(10, 3, 10)} />
          <Crate position={new Vector3(-10, 4, 10)} />
          <Crate position={new Vector3(-10, 5, -10)} />
        </Physics>
      </Canvas>
    </div>
  );
};

export default Page;
