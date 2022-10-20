import { Clock, Euler, MathUtils, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import { Box, Capsule, Line, OrbitControls, Plane, Torus } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Debug, interactionGroups, Physics, RigidBody, RigidBodyApi, useRapier } from '@react-three/rapier';
import type { NextPage } from 'next';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { lerp } from 'three/src/math/MathUtils';
import { Ray, QueryFilterFlags } from '@dimforge/rapier3d-compat';
import { debug } from 'console';

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
  const { world: worldApi } = useRapier();

  const debugVector = useRef<Vector3>(new Vector3());

  const { controls } = useKeyControls();
  const body = useRef<RigidBodyApi>(null);
  const steeringTarget = useRef<Quaternion>(new Quaternion());
  const velocity = useRef<Vector3>(new Vector3());
  const acceleration = useRef<Vector3>(new Vector3());

  let tmpVector = new Vector3();
  let tmpDirection = new Vector3();
  let tmpRotation = new Quaternion();
  const bodyRadius = 0.5;
  const hoverHeight = 1 + bodyRadius;

  const forwardVector = new Vector3(0, 0, 1).normalize();
  const downVector = new Vector3(0, -1, 0).normalize();
  const forwardDownVector = new Vector3(0, -1, 4).normalize();
  const backwardDownVector = new Vector3(0, -1, -4).normalize();

  const ray = new Ray(new Vector3(), new Vector3());
  const rayDown = new Ray(new Vector3(), downVector);
  const rayForwardDown = new Ray(new Vector3(), forwardDownVector);
  const rayBackwardDown = new Ray(new Vector3(), backwardDownVector);
  const rayForwardDownLength = new Vector3(0, hoverHeight, 4 * hoverHeight).length();

  const debugUp = useRef<Vector3>(new Vector3(0, 1, 0));
  const debugBoxX = useRef<Mesh>(null);
  const debugPlane = useRef<Mesh>(null);
  const debugYRotation = useRef<Mesh>(null);

  useEffect(() => {
    if (!body.current) return;

    steeringTarget.current = body.current.rotation();
  }, []);

  let ticker = 0;
  useFrame(({ clock }) => {
    if (!body.current) return;

    const { forward, backward, left, right } = controls;
    const world = worldApi.raw();

    const rotation = body.current.rotation();

    // rotate on object y-axis
    if (left) {
      tmpVector.set(0, 1, 0);
      tmpRotation.setFromAxisAngle(tmpVector, Math.PI / 32).normalize();
      steeringTarget.current.multiply(tmpRotation);
    } else if (right) {
      tmpVector.set(0, 1, 0);
      tmpRotation.setFromAxisAngle(tmpVector, -Math.PI / 32).normalize();
      steeringTarget.current.multiply(tmpRotation);
    }

    // rotate on object x-axis
    if (forward) {
      tmpVector.set(1, 0, 0);
      tmpRotation.setFromAxisAngle(tmpVector, Math.PI / 32).normalize();
      steeringTarget.current.multiply(tmpRotation);
    } else if (backward) {
      tmpVector.set(1, 0, 0);
      tmpRotation.setFromAxisAngle(tmpVector, -Math.PI / 32).normalize();
      steeringTarget.current.multiply(tmpRotation);
    }

    const yVector = new Vector3(0, 0, 1);
    yVector.applyQuaternion(steeringTarget.current);

    body.current.setNextKinematicRotation(rotation.slerp(steeringTarget.current, 0.1));

    ticker++;

    if (ticker > 1) {
      ticker = 0;
      const object = new Object3D();
      object.setRotationFromQuaternion(rotation);
      yVector.projectOnPlane(new Vector3(0, 1, 0)).normalize();

      //

      const forwardVector = new Vector3(0, 0, 1);
      const upVector = new Vector3(0, 1, 0);
      const rightVector = new Vector3(1, 0, 0);

      const forwardDirection = forwardVector.clone().applyQuaternion(rotation);
      const upDirection = upVector.clone().applyQuaternion(rotation);
      const rightDirection = rightVector.clone().applyQuaternion(rotation);

      //

      forwardDirection.projectOnPlane(upVector).normalize();
      // rightDirection.projectOnPlane(upVector).normalize();

      let angleY = forwardVector.angleTo(forwardDirection);
      if (forwardDirection.x < 0) {
        angleY *= -1;
      }
      if (debugYRotation.current) {
        debugYRotation.current.rotation.x = 0;
        debugYRotation.current.rotation.y = angleY;
        debugYRotation.current.rotation.z = 0;
      }

      if (debugPlane.current) {
        debugPlane.current.rotation.x = 0;
        debugPlane.current.rotation.y = angleY;
        debugPlane.current.rotation.z = 0;
      }

      upDirection.projectOnPlane(forwardDirection);
      // upDirection.dot(forwardDirection);
      tmpRotation.setFromAxisAngle(upVector, -angleY);
      upDirection.applyQuaternion(tmpRotation);
      upDirection.normalize();
      upDirection.z = 0;
      debugVector.current = upDirection;
      console.log('🚀 ~ file: physics.tsx ~ line 184 ~ debugVector.current', debugVector.current);

      if (debugPlane.current) {
        debugPlane.current.applyQuaternion(tmpRotation);
      }

      let angleZ = upDirection.angleTo(upVector);

      // console.log('🚀 ~ file: physics.tsx ~ line 172 ~ rightDirection', upDirection);
      if (debugBoxX.current) {
        if (upDirection.z < 0) {
          // angleZ *= -1;
        }
        debugBoxX.current.rotation.x = 0;
        debugBoxX.current.rotation.y = angleY;
        debugBoxX.current.rotation.z = angleZ;
      }

      tmpVector.set(0, 0, 1);
      tmpRotation.setFromAxisAngle(tmpVector, angleZ * 0.1).normalize();
      // console.log('🚀 ~ file: physics.tsx ~ line 187 ~ angleZ', angleZ);
      // steeringTarget.current.multiply(tmpRotation);
    }
  });

  return (
    <>
      <Line points={[new Vector3(), debugVector.current]} />
      {/* <Box args={[1, 0.1, 0.1]} ref={debugBoxX}>
        <meshNormalMaterial />
      </Box> */}
      <Box args={[1, 1, 0.1]} ref={debugPlane}>
        <meshNormalMaterial />
      </Box>
      <Box args={[0.1, 0.1, 1]} ref={debugYRotation}>
        <meshNormalMaterial />
      </Box>

      <RigidBody
        ref={body}
        type="kinematicPosition"
        colliders="hull"
        position={[0, hoverHeight, 0]}
        // rotation={[0.1, 0, 0]}
        collisionGroups={interactionGroups(0, [0, 1, 2])}
        mass={1}
      >
        <Box args={[1, 0.5, 2]}>
          <meshNormalMaterial />
        </Box>
      </RigidBody>
    </>
  );
};

const Page: NextPage = () => {
  return (
    <div className="fixed w-full h-screen">
      <Canvas>
        <OrbitControls />
        <axesHelper />
        <Physics colliders="hull">
          <Debug />

          <Player />

          {/* <RigidBody
            collisionGroups={interactionGroups(2, [0, 1, 2])}
            type="dynamic"
            restitution={1.2}
            position={[2, 1, 2]}
            mass={10}
          >
            <Torus />
          </RigidBody> */}

          {/* <RigidBody type="fixed" colliders="cuboid" collisionGroups={interactionGroups(1, [0, 1, 2])}>
            <Box args={[200, 0.1, 200]} position={[0, -1, 0]}>
              <meshNormalMaterial />
            </Box>

            <Box args={[200, 0.1, 200]} position={[0, -1, -20]} rotation={[Math.PI * 0.125, 0, 0]}>
              <meshNormalMaterial />
            </Box>
          </RigidBody> */}
        </Physics>
      </Canvas>
    </div>
  );
};

export default Page;
