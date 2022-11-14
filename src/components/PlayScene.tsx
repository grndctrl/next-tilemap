import { Canvas } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import Lighting from "./Lighting";
import { OrthographicCamera, Vector3 } from "three";
import Controls from "./Controls";
import SceneInterface from "./UserInterface/SceneInterface";
import World from "./World";
import Track from "./Track";
import { useEffect, useState } from "react";
import { useTrack } from "core/Track/hooks";
import Player from "./Player";
import PostProcessing from "./PostProcessing";
import {
  interactionGroups,
  Physics,
  RigidBody,
  RigidBodyApi,
  Debug,
} from "@react-three/rapier";

function Scene() {
  const { getBlock } = useTrack();
  const [start, setStart] = useState<Vector3 | null>(null);

  useEffect(() => {
    const start = getBlock(0);

    if (start) {
      setStart(start.worldPosition.clone().add(new Vector3(0, 10, 0)));
    }
  }, []);

  return (
    <Canvas gl={{ antialias: false }} dpr={2} shadows>
      <Lighting />
      {/* <Controls /> */}
      <SceneInterface />
      {start && <Box position={start} />}
      <Physics>
        {start && <Player startPosition={start} />}
        {/* <Debug /> */}
        <World />
        <Track />
      </Physics>
    </Canvas>
  );
}

export default Scene;
