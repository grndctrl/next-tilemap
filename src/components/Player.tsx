import { useFrame, useThree } from "@react-three/fiber";
import { RigidBodyApi } from "@react-three/rapier";
import { useWorld } from "core/World";
import { useControls } from "leva";
import { useRef, RefObject, useEffect } from "react";
import { Quaternion, Vector3 } from "three";
import { useKeyControls } from "../hooks/keyControls";
import HoverCar from "./HoverCar";

export const useFollowingCamera = (target: RefObject<RigidBodyApi>) => {
  const { camera, clock } = useThree();
  const offset = new Vector3(0, 20, -8);
  const lookAhead = new Vector3(0, 0, 4);

  useFrame(() => {
    if (!target.current) return null;

    const t = 0.1;

    const rotation = target.current.rotation();
    const translation = target.current.translation();

    const forwardVector = new Vector3(0, 0, 1)
      .applyQuaternion(rotation)
      .projectOnPlane(new Vector3(0, 1, 0))
      .normalize();
    const correctedRotation = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1),
      forwardVector
    );

    const position = offset
      .clone()
      .applyQuaternion(correctedRotation)
      .add(translation);
    const lookAt = lookAhead
      .clone()
      .applyQuaternion(correctedRotation)
      .add(translation);

    camera.position.lerp(position, t);
    camera.lookAt(lookAt);
  });
};

type PlayerProps = {
  startPosition: Vector3;
};

const Player = ({ startPosition }: PlayerProps) => {
  const { measurements } = useWorld();

  const bodyRef = useRef<RigidBodyApi>(null);
  const { hoverForce, hoverHeight, driveSpeed, steeringSpeed } = useControls({
    hoverForce: {
      value: 1.6,
      min: 0,
      max: 4,
      step: 0.01,
    },
    hoverHeight: {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.01,
    },
    driveSpeed: {
      value: 1,
      min: 0,
      max: 2,
    },
    steeringSpeed: {
      value: 0.05,
      min: 0,
      max: 0.5,
    },
  });
  const { forward, backward, left, right } = useKeyControls();

  useFollowingCamera(bodyRef);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.setTranslation(startPosition);
    }
  }, []);

  useFrame(() => {
    if (!bodyRef.current) return null;

    const translation = bodyRef.current.translation();
    const rotation = bodyRef.current.rotation();

    if (translation.y < -0.5 * measurements.worldSize.y) {
      bodyRef.current.setTranslation(new Vector3(0, 4, 0));
      bodyRef.current.setRotation(new Quaternion());
      bodyRef.current.resetForces();
      bodyRef.current.resetTorques();
      return null;
    }

    const forwardVector = new Vector3(0, 0, 1).applyQuaternion(rotation);
    const impulse = forwardVector
      .clone()
      .multiplyScalar(driveSpeed * (Number(forward) - Number(backward)));
    const torqueImpuls = new Vector3(
      0,
      steeringSpeed * (Number(left) - Number(right)),
      0
    );

    bodyRef.current.applyImpulse(impulse);
    bodyRef.current.applyTorqueImpulse(torqueImpuls);
  });

  return (
    <HoverCar ref={bodyRef} hoverForce={hoverForce} hoverHeight={hoverHeight} />
  );
};

export default Player;
