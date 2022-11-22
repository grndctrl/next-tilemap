import { TrackModel } from 'models/TrackModel';
import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { useMouseControls } from 'hooks/mouseControls';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Vector3 } from 'three';
import { BlockType } from 'utils/blockUtils';
import { blockSize } from 'utils/constants';
import { useInterfaceStore } from 'utils/interfaceStore';
import { UISelection } from 'utils/interfaceUtils';
import { Arrow } from 'models/Arrow';

type AddTrackBlockProps = {
  blockHovered: {
    block: BlockType;
    vertex: { index: number; position: Vector3 };
    geometry: BufferGeometry;
  };
  neighbours: {
    block: BlockType;
    position: Vector3;
    geometry: BufferGeometry;
  }[];
};

const AddTrackBlock = ({ blockHovered, neighbours }: AddTrackBlockProps) => {
  const position = useMemo(
    () => blockHovered.block.worldPosition.clone().add(new Vector3(0, blockSize.y, 0)),
    [blockHovered.block.worldPosition],
  );

  const blocks = useRef<BlockType[]>([]);
  const blocksFrom = useRef<BlockType[]>([]);
  const blocksTo = useRef<BlockType[]>([]);

  const { setCurrUISelection, trackSettings } = useInterfaceStore();

  const { length, setBlock } = useTrack();

  const { leftButton } = useMouseControls();

  const sortBlocks = useCallback(() => {
    if (blockHovered.vertex.index === 0 || blockHovered.vertex.index === 4) {
      return [neighbours[0].block, neighbours[1].block, neighbours[2].block, blockHovered.block];
    } else if (blockHovered.vertex.index === 1 || blockHovered.vertex.index === 5) {
      return [neighbours[0].block, neighbours[1].block, blockHovered.block, neighbours[2].block];
    } else if (blockHovered.vertex.index === 2 || blockHovered.vertex.index === 6) {
      return [neighbours[0].block, blockHovered.block, neighbours[1].block, neighbours[2].block];
    }

    return [blockHovered.block, neighbours[0].block, neighbours[1].block, neighbours[2].block];
  }, [blockHovered.block, blockHovered.vertex.index, neighbours]);

  useEffect(() => {
    if (neighbours.length < 3) {
      blocks.current = [];
      blocksFrom.current = [];
      blocksTo.current = [];
      return;
    }

    blocks.current = sortBlocks();

    if (trackSettings.direction.from === TrackDirection.NORTH) {
      blocksFrom.current = [blocks.current[1], blocks.current[0]];
      blocksTo.current = [blocks.current[3], blocks.current[2]];
    } else if (trackSettings.direction.from === TrackDirection.WEST) {
      blocksFrom.current = [blocks.current[0], blocks.current[2]];
      blocksTo.current = [blocks.current[1], blocks.current[3]];
    } else if (trackSettings.direction.from === TrackDirection.SOUTH) {
      blocksFrom.current = [blocks.current[2], blocks.current[3]];
      blocksTo.current = [blocks.current[0], blocks.current[1]];
    } else if (trackSettings.direction.from === TrackDirection.EAST) {
      blocksFrom.current = [blocks.current[3], blocks.current[1]];
      blocksTo.current = [blocks.current[2], blocks.current[0]];
    }
  }, [neighbours.length, sortBlocks, trackSettings.direction.from]);

  //   useEffect(() => {
  //     if (leftButton && length === 0) {
  //       const trackBlock: TrackBlockType = {
  //         id: 0,
  //         worldPosition: position,
  //         direction: {
  //           from: TrackDirection.SOUTH,
  //           to: TrackDirection.NORTH,
  //           angle: TrackAngle.STRAIGHT,
  //         },
  //         track: {
  //           variation: TrackVariation.FORWARD,
  //           isPartial: false,
  //         },
  //       };
  //       setBlock(trackBlock);
  //       setCurrUISelection(UISelection.EDITROAD);
  //
  //       console.log('tick');
  //     }
  //   }, [leftButton, position]);

  return <Arrow position={position} />;
};

export default AddTrackBlock;
