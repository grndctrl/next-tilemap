import {
  DirectionalLight,
  Vector3,
  DirectionalLightHelper,
  CameraHelper,
} from "three";
import { useRef, useEffect } from "react";
import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useWorld } from "core/World";
import { blockSize } from "utils/constants";

const WorldSizedLight = () => {
  const { measurements } = useWorld();
  const { worldSize, chunksInWorld } = measurements;

  return (
    <directionalLight
      castShadow
      color={"#fef3c7"}
      intensity={0.75}
      position={[
        blockSize.x,
        worldSize.y * 0.75 + blockSize.y,
        blockSize.z * 0.25,
      ]}
      shadow-mapSize={[1024 * chunksInWorld.x, 1024 * chunksInWorld.z]}
    >
      <orthographicCamera
        attach="shadow-camera"
        near={1}
        far={worldSize.y * 1.5}
        left={-measurements.worldSize.x * 0.625}
        right={measurements.worldSize.x * 0.625}
        top={measurements.worldSize.z * 0.625}
        bottom={-measurements.worldSize.z * 0.625}
      />
    </directionalLight>
  );
};

const DebugLight = () => {
  const dirLight = useRef<DirectionalLight>(new DirectionalLight(0xffffff, 1));
  const { measurements } = useWorld();
  const { position } = useControls({
    position: {
      x: blockSize.x,
      y: measurements.worldSize.y * 0.75 + blockSize.y,
      z: blockSize.z * 0.25,
    },
  });

  dirLight.current.position.set(position.x, position.y, position.z);
  dirLight.current.castShadow = true;
  dirLight.current.shadow.camera.near = 1;
  dirLight.current.shadow.camera.far = measurements.worldSize.y * 1.5;
  dirLight.current.shadow.camera.right = measurements.worldSize.x * 0.625;
  dirLight.current.shadow.camera.left = -measurements.worldSize.x * 0.625;
  dirLight.current.shadow.camera.top = measurements.worldSize.z * 0.625;
  dirLight.current.shadow.camera.bottom = -measurements.worldSize.z * 0.625;
  dirLight.current.shadow.mapSize.width = 1024 * measurements.chunksInWorld.x;
  dirLight.current.shadow.mapSize.height = 1024 * measurements.chunksInWorld.z;

  // useEffect(() => {
  //   dirLight.position
  // }, [position])

  const { scene } = useThree();

  useEffect(() => {
    // scene.add(new CameraHelper(dirLight.current.shadow.camera));
    // scene.add(dirLight.current);
  }, []);

  return null;
};

const Lighting = (props: JSX.IntrinsicElements["group"]) => {
  return (
    <group {...props}>
      <ambientLight intensity={0.25} color="#ede9fe" />
      <WorldSizedLight />
    </group>
  );
};

export default Lighting;
