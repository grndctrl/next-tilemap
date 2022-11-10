import { Box } from "@react-three/drei";
import { useEffect, useState } from "react";
import { BlockType } from "../utils/blockUtils";
import { blockSize } from "utils/constants";
import { useInterfaceStore } from "../utils/interfaceStore";
import { UISelection } from "../utils/interfaceUtils";
import { getNextTrackBlock } from "utils/trackUtils";
import { TrackModel } from "./TrackModel";
import { Vector3 } from "three";
import {
  TrackAngle,
  TrackBlockType,
  TrackDirection,
  TrackVariation,
} from "core/Track";
import { useTrack } from "core/Track/hooks";
import { useWorld } from "core/World";
import { colors } from "utils/tailwindDefaults";

type NextRoadBlockProps = {
  lastBlock: TrackBlockType;
};

const NextRoadBlock = ({ lastBlock }: NextRoadBlockProps) => {
  const { getBlock } = useWorld();
  const currEditRoadAngle = useInterfaceStore(
    (state) => state.currEditRoadAngle
  );
  const [nextBlock, setNextBlock] = useState<BlockType | null>(null);
  const [position, setPosition] = useState<Vector3>(new Vector3());
  const variation =
    currEditRoadAngle === TrackAngle.UP
      ? TrackVariation.FORWARD_UP
      : currEditRoadAngle === TrackAngle.DOWN
      ? TrackVariation.FORWARD_DOWN
      : TrackVariation.FORWARD_STRAIGHT;

  useEffect(() => {
    const nextBlock = getNextTrackBlock(getBlock, lastBlock, currEditRoadAngle);
    if (nextBlock) {
      setNextBlock(nextBlock);

      const position = nextBlock.worldPosition.clone();

      if (variation === TrackVariation.FORWARD_UP) {
        position.add(new Vector3(0, blockSize.y, 0));
      }

      setPosition(position);
    }
  }, [blockSize.y, currEditRoadAngle, lastBlock, variation]);

  return (
    <>
      {nextBlock && (
        <group position={nextBlock.worldPosition.clone()}>
          <TrackModel
            variation={variation}
            rotation={[
              0,
              Math.PI * 0.5 * ((lastBlock.direction.to + 2) % 4) + Math.PI,
              0,
            ]}
            color={colors.sky[500]}
          />
        </group>
      )}
    </>
  );
};

type TrackMeshProps = {
  trackBlock: TrackBlockType;
};

const TrackMesh = ({ trackBlock }: TrackMeshProps) => {
  return (
    <group position={trackBlock.worldPosition}>
      <TrackModel
        variation={trackBlock.track.variation}
        rotation={[0, Math.PI * 0.5 * trackBlock.direction.from + Math.PI, 0]}
      />
      {/* <Box args={[1, 0.5, 1]}>
        <meshBasicMaterial color={'black'} wireframe />
      </Box> */}
    </group>
  );
};

const TrackBlock = () => {
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
        <TrackMesh key={`track-${index}`} trackBlock={trackBlock} />
      ))}
      {currUISelection === UISelection.EDITROAD && trackBlocks.length > 0 && (
        <NextRoadBlock lastBlock={trackBlocks[trackBlocks.length - 1]} />
      )}
    </group>
  );
};

export default TrackBlock;
