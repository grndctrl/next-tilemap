import { Canvas } from "@react-three/fiber";
import { useTrack } from "core/Track/hooks";
import { useEffect } from "react";
import { OrthographicCamera } from "three";
import Controls from "./Controls";
import Lighting from "./Lighting";
import Track from "./Track";
import SceneInterface from "./UserInterface/SceneInterface";
import World from "./World";

function PlayScene() {
  const camera = new OrthographicCamera();
  camera.position.set(-256, 256, 256);
  camera.zoom = 8;
  camera.rotation.set(-30 * (Math.PI / 180), -Math.PI / 4, 0, "YXZ");
  camera.near = 0.1;
  camera.far = 1000;

  const { getBlock } = useTrack();

  useEffect(() => {
    const start = getBlock(0);

    if (start) {
    }
  }, []);

  return (
    <Canvas gl={{ antialias: false }} dpr={2} camera={camera} shadows>
      <Lighting />
      <Controls />
      <SceneInterface />
      <World />
      <Track />
    </Canvas>
  );
}

export default PlayScene;
