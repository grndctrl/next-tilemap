import { Ray, World } from '@dimforge/rapier3d-compat';
import { Box, Cone, Line, OrbitControls, PerspectiveCamera, Sphere, useKeyboardControls } from '@react-three/drei';
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
import { ForwardedRef, forwardRef, RefObject, Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Quaternion, Vector3 } from 'three';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';
import { useControls } from 'leva';
import { useKeyControls } from '../hooks/keyControls';
import { Perf } from 'r3f-perf';
import { Model } from '../models/Hovercar';

type HoverEngineProps = {
  position: Vector3;
  bodyRef: ForwardedRef<RigidBodyApi>;
  world: World;
  hoverForce?: number;
  hoverHeight?: number;
  visible?: boolean;
};

const HoverEngine = ({
  position,
  bodyRef,
  world,
  hoverForce = 1,
  hoverHeight = 1,
  visible = false,
}: HoverEngineProps) => {
  const downVector = new Vector3(0, -1, 0);
  const upVector = new Vector3(0, 1, 0);
  const ray = new Ray(position, downVector);

  useFrame(() => {
    if (bodyRef != null && typeof bodyRef !== 'function') {
      if (!bodyRef.current) return null;

      const translation = bodyRef.current.translation();
      const rotation = bodyRef.current.rotation();
      const origin = position.clone().applyQuaternion(rotation).add(translation);

      ray.origin = origin;
      ray.dir = downVector.clone().applyQuaternion(rotation);

      const hit = world.castRay(ray, hoverHeight, true, undefined, interactionGroups(0, [1]));

      if (hit) {
        const point = new Vector3(ray.pointAt(hit.toi).x, ray.pointAt(hit.toi).y, ray.pointAt(hit.toi).z);
        const diff = hoverHeight - point.distanceTo(origin);

        const forceVector = upVector
          .clone()
          .applyQuaternion(rotation)
          .normalize()
          .multiplyScalar(diff * hoverForce);

        bodyRef.current.applyImpulseAtPoint(forceVector, ray.origin);
      }
    }
  });

  return <Line visible={visible} points={[position, downVector.clone().multiplyScalar(hoverHeight).add(position)]} />;
};

type HoverCarProps = {
  hoverForce?: number;
  hoverHeight?: number;
};

const HoverCar = forwardRef<RigidBodyApi, HoverCarProps>(({ hoverForce = 1, hoverHeight = 1 }, bodyRef) => {
  const { world: worldApi } = useRapier();
  const world = worldApi.raw();
  const enginePositions = [
    new Vector3(-1.5, 0, 2),
    new Vector3(1.5, 0, 2),
    new Vector3(-1.5, 0, -2),
    new Vector3(1.5, 0, -2),
  ];

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={4}
      linearDamping={1}
      angularDamping={2}
      position={[0, 8, 0]}
      type={'dynamic'}
      collisionGroups={interactionGroups(0, [1])}
    >
      <MeshCollider type={'hull'}>
        <Model />
      </MeshCollider>

      {enginePositions.map((position, index) => {
        return (
          <HoverEngine
            key={index}
            position={position}
            bodyRef={bodyRef}
            world={world}
            hoverForce={hoverForce}
            hoverHeight={hoverHeight}
            visible={true}
          />
        );
      })}
    </RigidBody>
  );
});

HoverCar.displayName = 'HoverCar';

const Player = () => {
  const { hoverForce, hoverHeight, driveSpeed, steeringSpeed } = useControls({
    hoverForce: {
      value: 0.5,
      min: 0,
      max: 4,
      step: 0.01,
    },
    hoverHeight: {
      value: 2,
      min: 0,
      max: 4,
      step: 0.01,
    },
    driveSpeed: {
      value: 2,
      min: 0,
      max: 4,
    },
    steeringSpeed: {
      value: 1,
      min: 0,
      max: 4,
    },
  });
  const { forward, backward, left, right } = useKeyControls();
  const bodyRef = useRef<RigidBodyApi>(null);

  useFrame(() => {
    if (!bodyRef.current) return null;

    const translation = bodyRef.current.translation();
    const rotation = bodyRef.current.rotation();

    if (translation.y < -10) {
      bodyRef.current.setTranslation(new Vector3(0, 4, 0));
      bodyRef.current.setRotation(new Quaternion());
      bodyRef.current.resetForces();
      bodyRef.current.resetTorques();
      return null;
    }

    const forwardVector = new Vector3(0, 0, 1).applyQuaternion(rotation);
    const impulse = forwardVector.clone().multiplyScalar(driveSpeed * (Number(forward) - Number(backward)));
    const torqueImpuls = new Vector3(0, steeringSpeed * (Number(left) - Number(right)), 0);

    bodyRef.current.applyImpulse(impulse);
    bodyRef.current.applyTorqueImpulse(torqueImpuls);
  });

  return <HoverCar ref={bodyRef} hoverForce={hoverForce} hoverHeight={hoverHeight} />;
};

export default Player;
