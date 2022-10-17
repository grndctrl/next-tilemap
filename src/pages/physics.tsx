import { Clock, Quaternion, Vector3 } from 'three';
import { Box, Capsule, OrbitControls, Torus } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Debug, interactionGroups, Physics, RigidBody, RigidBodyApi, useRapier } from '@react-three/rapier';
import type { NextPage } from 'next';
import { Suspense, useEffect, useRef, useState } from 'react';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { lerp } from 'three/src/math/MathUtils';
import { Ray, QueryFilterFlags } from '@dimforge/rapier3d-compat';

const useKeyPress = (key: string, fn: (isDown: boolean, event: KeyboardEvent) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === key && fn(true, event);
    const handleKeyUp = (event: KeyboardEvent) => event.key === key && fn(false, event);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  return null;
};

type KeyControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

const useKeyControls = () => {
  const [controls, setControls] = useState<KeyControls>({ forward: false, backward: false, left: false, right: false });

  useKeyPress('w', (isDown, event) => {
    if ((isDown && !controls.forward) || !isDown) {
      setControls((state) => ({ ...state, forward: isDown }));
    }
  });
  useKeyPress('s', (isDown, event) => {
    if ((isDown && !controls.backward) || !isDown) {
      setControls((state) => ({ ...state, backward: isDown }));
    }
  });
  useKeyPress('a', (isDown, event) => {
    if ((isDown && !controls.left) || !isDown) {
      setControls((state) => ({ ...state, left: isDown }));
    }
  });
  useKeyPress('d', (isDown, event) => {
    if ((isDown && !controls.right) || !isDown) {
      setControls((state) => ({ ...state, right: isDown }));
    }
  });

  return { controls };
};

const Player = () => {
  const { world } = useRapier();

  const { controls } = useKeyControls();
  const body = useRef<RigidBodyApi>(null);
  const steeringTarget = useRef<Quaternion>(new Quaternion());
  const velocity = useRef<Vector3>(new Vector3());
  const acceleration = useRef<Vector3>(new Vector3());

  const ray = new Ray(new Vector3(), new Vector3(0, -1, 0));
  const tmpVector = new Vector3();
  const tmpRotation = new Quaternion();
  const bodyRadius = 0.5;

  useEffect(() => {
    if (!body.current) return;
  }, []);

  useFrame(({ clock }) => {
    if (!body.current) return;

    const { forward, backward, left, right } = controls;

    // if (forward) {
    //   tmpVector.set(0, 0, 1 * drive);
    //   tmpVector.applyQuaternion(direction);
    //   body.current.applyImpulse(tmpVector);
    // }

    // if (backward) {
    //   tmpVector.set(0, 0, -0.5 * drive);
    //   tmpVector.applyQuaternion(direction);
    //   body.current.applyImpulse(tmpVector);
    // }

    // gravity
    acceleration.current.y = -5 * 0.001;
    const translation = body.current.translation();
    ray.origin = translation;
    const hit = world.raw().castRay(ray, 10, false, undefined, interactionGroups(1, [1]));
    if (hit) {
      const point = ray.pointAt(hit.toi);
      const diff = translation.y - (point.y + bodyRadius);

      acceleration.current.y += (2 - diff) * 10 * 0.001;
    }

    velocity.current.add(acceleration.current);
    velocity.current.y *= 0.9;

    // drive
    const rotation = body.current.rotation();
    const drive = new Vector3(0, 0, 0);

    if (forward) {
      drive.z = 0.25;
    } else if (backward) {
      drive.z = -0.25;
    }

    drive.applyQuaternion(rotation);
    velocity.current.x = drive.x;
    velocity.current.y += drive.y;
    velocity.current.z = drive.z;

    body.current.setNextKinematicTranslation({
      x: translation.x + velocity.current.x,
      y: translation.y + velocity.current.y,
      z: translation.z + velocity.current.z,
    });

    // steering
    let angle = 0;
    if (left) {
      angle = 0.02;
      tmpRotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * angle);
      steeringTarget.current.multiply(tmpRotation);
    } else if (right) {
      angle = -0.02;
      tmpRotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * angle);
      steeringTarget.current.multiply(tmpRotation);
    }

    body.current.setNextKinematicRotation(body.current.rotation().slerp(steeringTarget.current, 0.1));
  });

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders="hull"
      position={[0, 4, 0]}
      collisionGroups={interactionGroups(0, [0, 1, 2])}
      mass={1}
    >
      <Box args={[1, 1, 2]}>
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
        <Physics colliders="hull">
          <Debug />

          <Player />

          <RigidBody
            collisionGroups={interactionGroups(2, [0, 1, 2])}
            type="dynamic"
            restitution={1.2}
            position={[2, 1, 2]}
            mass={10}
          >
            <Torus />
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid" collisionGroups={interactionGroups(1, [0, 1, 2])}>
            <Box args={[200, 0.1, 200]} position={[0, -1, 0]}>
              <meshNormalMaterial />
            </Box>

            <Box args={[200, 0.1, 200]} position={[0, -1, -50]} rotation={[Math.PI * 0.125, 0, 0]}>
              <meshNormalMaterial />
            </Box>
          </RigidBody>
        </Physics>
      </Canvas>
    </div>
  );
};

export default Page;
