import { Ray } from '@dimforge/rapier3d-compat';
import { Box, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { interactionGroups, MeshCollider, Physics, RigidBody, RigidBodyApi, useRapier } from '@react-three/rapier';
import type { NextPage } from 'next';
import { Suspense, useRef } from 'react';
import { Vector3 } from 'three';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';

const Hover = () => {
  const { world: worldApi } = useRapier();
  const body = useRef<RigidBodyApi>(null);
  const velocity = useRef<Vector3>(new Vector3());
  const acceleration = useRef<Vector3>(new Vector3());
  const world = worldApi.raw();
  const bodyRadius = 0.5;
  const hoverHeight = 1;

  useFrame(({ clock }) => {
    if (!body.current) return;

    const translation = body.current.translation();
    const direction = new Vector3(0, -1, 0);

    acceleration.current.y = -5 * 0.001;

    // raycast
    const ray = new Ray(translation, direction);
    const hit = world.castRay(ray, 2 + bodyRadius, false, undefined, interactionGroups(1, [1]));

    if (hit) {
      const point = ray.pointAt(hit.toi);
      const diff = translation.y - (point.y + bodyRadius);

      // if (diff > 0) {
      //   acceleration.current.y = diff * -5 * clock.getDelta();
      //   // acc < 0

      //   // acceleration.current.y = diff * -9.81 * clock.getDelta();
      // }
      // if (diff === 0) {
      //   // acc = 0
      //   acceleration.current.y = 0;
      // }
      // if (diff < 0) {
      //   acceleration.current.y += -diff * 10 * clock.getDelta();
      //   // acc > 0
      //   // acceleration.current.y = diff * 9.81 * clock.getDelta();
      //   // acceleration.current.y = 2 * diff * 9.81 * clock.getDelta();
      //   // velocity.current.y = 0;
      // }

      acceleration.current.y += (2 - diff) * 10 * 0.001;
    }

    // move box
    velocity.current.add(acceleration.current);
    velocity.current.y *= 0.9;
    translation.x += velocity.current.x;
    translation.y += velocity.current.y;
    translation.z += velocity.current.z;
    body.current.setNextKinematicTranslation(translation);
  });

  return (
    <RigidBody
      ref={body}
      colliders="cuboid"
      position={[0, 4, 0]}
      type="kinematicPosition"
      collisionGroups={interactionGroups(0, [1])}
    >
      <Box args={[1, 1, 2]}>
        <meshNormalMaterial />
      </Box>
    </RigidBody>
  );
};

const Ground = () => {
  return (
    <RigidBody colliders="cuboid" type="fixed" collisionGroups={interactionGroups(1, [0, 1])}>
      <Box args={[100, 0.1, 100]}>
        <meshNormalMaterial />
      </Box>
    </RigidBody>
  );
};

const Page: NextPage = () => {
  return (
    <div className="fixed w-full h-screen">
      <Canvas>
        <OrbitControls />
        <Physics>
          <Hover />
          <Ground />
        </Physics>
      </Canvas>
    </div>
  );
};

export default Page;
