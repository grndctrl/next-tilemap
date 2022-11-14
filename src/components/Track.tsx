import { Box } from "@react-three/drei";
import { TrackBlockType } from "core/Track";
import { useTrack } from "core/Track/hooks";
import { TrackModel } from "models/TrackModel";
import { useEffect, useState } from "react";
import { useInterfaceStore } from "utils/interfaceStore";
import { UISelection } from "utils/interfaceUtils";
import NextTrackBlock from "./UserInterface/NextTrackBlock";
import { RigidBody } from "@react-three/rapier";

const Track = () => {
  const currUISelection = useInterfaceStore((state) => state.currUISelection);
  const { length, getBlock } = useTrack();

  const [trackBlocks, setTrackBlocks] = useState<TrackBlockType[]>([]);

  useEffect(() => {
    const currBlocks: TrackBlockType[] = [];

    Array.from({ length }).forEach((_, index) => {
      const block = getBlock(index);
      if (block) {
        currBlocks.push(block);
      }
    });

    setTrackBlocks(currBlocks);
  }, [getBlock, length]);

  useEffect(() => {
    console.log("trackBlocks", trackBlocks);
  }, [trackBlocks]);

  return (
    <group>
      {trackBlocks.map((trackBlock, index) => (
        <RigidBody key={`track-${index}`} type="fixed" colliders="trimesh">
          <TrackModel
            position={trackBlock.worldPosition}
            variation={trackBlock.track.variation}
            angle={trackBlock.direction.angle}
            rotation={[
              0,
              Math.PI * 0.5 * trackBlock.direction.from + Math.PI,
              0,
            ]}
          />
        </RigidBody>
      ))}
    </group>
  );
};

export default Track;
