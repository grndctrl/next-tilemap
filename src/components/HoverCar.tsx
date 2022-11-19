import { Ray, World } from "@dimforge/rapier3d-compat";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  interactionGroups,
  MeshCollider,
  RigidBody,
  RigidBodyApi,
  useRapier,
} from "@react-three/rapier";
import { ForwardedRef, forwardRef } from "react";
import { Vector3 } from "three";
import { Model } from "assets/models/Hovercar";

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
  hoverForce = 0.5,
  hoverHeight = 0.5,
  visible = false,
}: HoverEngineProps) => {
  const downVector = new Vector3(0, -1, 0);
  const upVector = new Vector3(0, 1, 0);
  const ray = new Ray(position, downVector);

  useFrame(() => {
    if (bodyRef != null && typeof bodyRef !== "function") {
      if (!bodyRef.current) return null;

      const translation = bodyRef.current.translation();
      const rotation = bodyRef.current.rotation();
      const origin = position
        .clone()
        .applyQuaternion(rotation)
        .add(translation);

      ray.origin = origin;
      ray.dir = downVector.clone().applyQuaternion(rotation);

      const hit = world.castRay(
        ray,
        hoverHeight,
        true,
        undefined,
        interactionGroups(0, [1])
      );

      if (hit) {
        const point = new Vector3(
          ray.pointAt(hit.toi).x,
          ray.pointAt(hit.toi).y,
          ray.pointAt(hit.toi).z
        );
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

  return (
    <Line
      visible={visible}
      points={[
        position,
        downVector.clone().multiplyScalar(hoverHeight).add(position),
      ]}
    />
  );
};

type HoverCarProps = {
  hoverForce?: number;
  hoverHeight?: number;
};

const HoverCar = forwardRef<RigidBodyApi, HoverCarProps>(
  ({ hoverForce = 1, hoverHeight = 1 }, bodyRef) => {
    const { world: worldApi } = useRapier();
    const world = worldApi.raw();
    const enginePositions = [
      new Vector3(-1.5, 0, 2).multiplyScalar(0.25),
      new Vector3(1.5, 0, 2).multiplyScalar(0.25),
      new Vector3(-1.5, 0, -2).multiplyScalar(0.25),
      new Vector3(1.5, 0, -2).multiplyScalar(0.25),
    ];

    return (
      <RigidBody
        ref={bodyRef}
        colliders={false}
        mass={4}
        linearDamping={1}
        angularDamping={2}
        position={[0, 8, 0]}
        type={"dynamic"}
        collisionGroups={interactionGroups(0, [1])}
      >
        <MeshCollider type={"hull"}>
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
  }
);

HoverCar.displayName = "HoverCar";

export default HoverCar;
