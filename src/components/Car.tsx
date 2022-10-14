import { Box, Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Debug, RigidBody, RigidBodyApi, RigidBodyApiRef, useRevoluteJoint, Vector3Array } from '@react-three/rapier';
import { createRef, ReactNode, useRef } from 'react';
import { Vector3 } from 'three';
import { useKeyControls } from '../hooks/keyControls';

const WheelJoint = ({
  body,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: {
  body: RigidBodyApiRef;
  wheel: RigidBodyApiRef;
  bodyAnchor: Vector3Array;
  wheelAnchor: Vector3Array;
  rotationAxis: Vector3Array;
}) => {
  const joint = useRevoluteJoint(body, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
  return null;
};

export interface Demo {
  (props: { children?: ReactNode }): JSX.Element;
}

export const Car: Demo = () => {
  const { forward, backward, left, right } = useKeyControls();
  const bodyRef = useRef<RigidBodyApi>(null);
  const wheelPositions: [number, number, number][] = [
    [-3, 0, 2],
    [-3, 0, -2],
    [3, 0, 2],
    [3, 0, -2],
  ];
  const wheelRefs = useRef(wheelPositions.map(() => createRef<RigidBodyApi>()));

  useFrame(() => {
    if (bodyRef.current) {
      const accelVec = new Vector3(0.5, 0, 0);
      const steerVec = new Vector3(0, 0, 0);
      accelVec.applyQuaternion(bodyRef.current.rotation());
      steerVec.applyQuaternion(bodyRef.current.rotation());

      wheelRefs.current.forEach((ref, index) => {
        // console.log(ref.current?.rotation());
        if (index < 2) {
        }
      });
      if (forward) {
        wheelRefs.current[0].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[2].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[1].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[3].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
      }

      if (left) {
        wheelRefs.current[0].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[2].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[1].current?.applyImpulse({ x: -accelVec.x, y: -accelVec.y, z: -accelVec.z });
        wheelRefs.current[3].current?.applyImpulse({ x: -accelVec.x, y: -accelVec.y, z: -accelVec.z });
      }

      if (right) {
        wheelRefs.current[0].current?.applyImpulse({ x: -accelVec.x, y: -accelVec.y, z: -accelVec.z });
        wheelRefs.current[2].current?.applyImpulse({ x: -accelVec.x, y: -accelVec.y, z: -accelVec.z });
        wheelRefs.current[1].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
        wheelRefs.current[3].current?.applyImpulse({ x: accelVec.x, y: accelVec.y, z: accelVec.z });
      }
    }
  });

  return (
    <group>
      <RigidBody colliders="cuboid" ref={bodyRef} type="dynamic">
        <Box scale={[6, 1, 1.9]} castShadow receiveShadow name="chassis">
          <meshStandardMaterial color={'red'} />
        </Box>
      </RigidBody>
      {wheelPositions.map((wheelPosition, index) => (
        <RigidBody position={wheelPosition} colliders="hull" type="dynamic" key={index} ref={wheelRefs.current[index]}>
          <Cylinder rotation={[Math.PI / 2, 0, 0]} args={[1, 1, 1, 32]} castShadow receiveShadow>
            <meshStandardMaterial color={'grey'} />
          </Cylinder>
        </RigidBody>
      ))}
      {wheelPositions.map((wheelPosition, index) => (
        <WheelJoint
          key={index}
          body={bodyRef}
          wheel={wheelRefs.current[index]}
          bodyAnchor={wheelPosition}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[0, 0, 1]}
        />
      ))}
    </group>
  );
};
