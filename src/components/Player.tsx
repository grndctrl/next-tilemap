import { useFrame } from '@react-three/fiber';
import { RigidBodyApi } from '@react-three/rapier';
import { useControls } from 'leva';
import { useRef } from 'react';
import { Quaternion, Vector3 } from 'three';
import { useKeyControls } from '../hooks/keyControls';
import { useFollowingCamera } from '../pages/hover';
import HoverCar from './HoverCar';

const Player = () => {
  const bodyRef = useRef<RigidBodyApi>(null);
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

  useFollowingCamera(bodyRef);

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
