import { Ray, World } from '@dimforge/rapier3d-compat';
import { Box, Line, OrbitControls, PerspectiveCamera, Sphere, useKeyboardControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  CuboidCollider,
  Debug,
  interactionGroups,
  MeshCollider,
  Physics,
  RigidBody,
  RigidBodyApi,
  useRapier,
} from '@react-three/rapier';
import type { NextPage } from 'next';
import { forwardRef, RefObject, Suspense, useImperativeHandle, useRef, useState } from 'react';
import { Vector3 } from 'three';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { useControls } from 'leva';
import { useKeyControls } from '../hooks/keyControls';
import { Perf } from 'r3f-perf';
import { Model } from '../models/Hovercar';
import Player from '../components/Player';

type HoverEngineProps = {
  position: Vector3;
  body: RefObject<RigidBodyApi>;
  world: World;
  force: number;
};

type HoverEngineRef = {
  ray: {
    origin: Vector3;
    dir: Vector3;
  };
  impact: Vector3;
};

const HoverEngine = forwardRef<HoverEngineRef, HoverEngineProps>(({ position, body, world: input, force }, ref) => {
  const downVector = new Vector3(0, -1, 0);
  const upVector = new Vector3(0, 1, 0);
  const ray = new Ray(position, downVector);
  const hoverHeight = 2;
  const [impact, setImpact] = useState<Vector3>(new Vector3());
  const [rayOrigin, setRayOrigin] = useState<Vector3>(new Vector3());
  const [rayDirection, setRayDirection] = useState<Vector3>(new Vector3());
  const rapier = useRapier();

  useImperativeHandle(
    ref,
    () => ({
      ray: {
        origin: rayOrigin,
        dir: rayDirection,
      },
      impact,
    }),
    [rayDirection, rayOrigin, impact]
  );

  useFrame(({ clock }) => {
    if (!body.current) return null;
    const translation = body.current.translation();
    const rotation = body.current.rotation();

    ray.origin = position.clone().applyQuaternion(rotation).add(translation);
    ray.dir = downVector.clone().applyQuaternion(rotation);
    setRayOrigin(position.clone().applyQuaternion(rotation).add(translation));
    setRayDirection(downVector.clone().applyQuaternion(rotation));

    // ray.dir = downVector.clone();
    const world = rapier.world.raw();
    const hit = world.castRay(ray, 1.0, true, undefined, interactionGroups(0, [1]));

    if (hit) {
      const point = ray.pointAt(hit.toi);
      const _impact = new Vector3(point.x, point.y, point.z);
      const diff = 1 - _impact.distanceTo(new Vector3(ray.origin.x, ray.origin.y, ray.origin.z));

      const forceVector = upVector
        .clone()
        .applyQuaternion(rotation)
        .normalize()
        .multiplyScalar(diff * force);
      body.current.applyImpulseAtPoint(forceVector, ray.origin);
    }
  });

  return (
    <>
      <Line visible={true} points={[position, position.clone().add(downVector)]} />
    </>
  );
});

HoverEngine.displayName = 'HoverEngine';

const Hover = () => {
  const { world: worldApi } = useRapier();
  const body = useRef<RigidBodyApi>(null);
  const velocity = useRef<Vector3>(new Vector3());
  const acceleration = useRef<Vector3>(new Vector3());
  const world = worldApi.raw();
  const bodyRadius = 0.5;
  const hoverHeight = 1;
  const enginePositions = [new Vector3(-1, 0, 1), new Vector3(1, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];
  const { hoverForce, damping, x, y, z, speed } = useControls({
    hoverForce: {
      value: 0.5,
      min: 0,
      max: 4,
      step: 0.01,
    },
    damping: {
      value: 2,
      min: 0,
      max: 100,
    },
    x: {
      value: 0,
      min: -2,
      max: 2,
    },
    y: {
      value: 0,
      min: -2,
      max: 2,
    },
    z: {
      value: 0,
      min: -2,
      max: 2,
    },
    speed: {
      value: 1,
      min: 0,
      max: 4,
    },
  });
  const engineRefs = useRef<(HoverEngineRef | null)[]>([]);

  const { forward, backward, left, right } = useKeyControls();

  useFrame(({ clock }) => {
    if (!body.current) return;

    const translation = body.current.translation();
    const rotation = body.current.rotation();

    const forwardVector = new Vector3(0, 0, 1).applyQuaternion(rotation);

    const drive = (Number(forward) - Number(backward)) * speed;
    const steering = (Number(left) - Number(right)) * speed * 0.25;

    body.current.applyImpulse(forwardVector.clone().multiplyScalar(drive));
    body.current.applyTorqueImpulse(new Vector3(0, steering, 0));
  });

  return (
    <>
      {engineRefs.current.map((ref, index) => {
        if (ref) {
          return (
            <group key={`ray-${index}`}>
              <Sphere args={[0.1]} position={ref.impact} />
              <Line points={[ref.ray.origin, ref.ray.origin.clone().add(ref.ray.dir)]} />;
            </group>
          );
        }
        return <group key={`ray-${index}`}></group>;
      })}
      <RigidBody
        ref={body}
        colliders={false}
        // position={[x, y, z]}
        // rotation={[x, 0, 0]}
        // type={'kinematicPosition'}
        position={[0, 4, 0]}
        type={'dynamic'}
        collisionGroups={interactionGroups(0, [1])}
        angularDamping={damping}
        linearDamping={damping}
      >
        <MeshCollider type={'hull'}>
          <Box args={[1, 1, 2]}>
            <meshNormalMaterial />
          </Box>
          {/* <Model /> */}
        </MeshCollider>

        {enginePositions.map((position, index) => {
          return (
            <HoverEngine
              ref={(ref) => (engineRefs.current[index] = ref)}
              key={index}
              position={position}
              body={body}
              world={world}
              force={hoverForce}
            />
          );
        })}
      </RigidBody>
    </>
  );
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
        <OrbitControls minDistance={10} />
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
        <Physics>
          {/* <Debug /> */}
          {/* <Hover /> */}
          <Player />
          <Ground />
        </Physics>
      </Canvas>
    </div>
  );
};

export default Page;
