import { BufferGeometry, BufferGeometry, Mesh, Vector3 } from 'three';
import createHook from 'zustand';
import { devtools } from 'zustand/middleware';
import create from 'zustand/vanilla';
// import { DirectionAngle } from '../components/Road';
import { BlockType } from './blockUtils';
import { UISelection } from './interfaceUtils';
import { TrackAngle, TrackBlockType, TrackDirection, TrackVariation } from 'core/Track';
import { createRef, MutableRefObject, RefObject } from 'react';

type InterfaceStore = {
  blockHovered: {
    block: BlockType;
    vertex: { index: number; position: Vector3 };
    geometry: BufferGeometry;
  } | null;

  setBlockHovered: (
    blockHovered: {
      block: BlockType;
      vertex: { index: number; position: Vector3 };
      geometry: BufferGeometry;
    } | null,
  ) => void;

  blocksHovered: {
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
  } | null;

  setBlocksHovered: (
    blocksHovered: {
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
    } | null,
  ) => void;

  blockMutated: {
    block: BlockType;
    vertex: { index: number; position: Vector3 };
    geometry: BufferGeometry;
  } | null;

  setBlockMutated: (
    blockMutated: {
      block: BlockType;
      vertex: { index: number; position: Vector3 };
      geometry: BufferGeometry;
    } | null,
  ) => void;

  currUISelection: UISelection | null;

  setCurrUISelection: (selection: UISelection | null) => void;

  isGeneratingWorld: boolean;

  toggleGeneratingWorld: (toggle: boolean) => void;

  trackSettings: {
    angle: TrackAngle;
    variation: TrackVariation;
    direction: {
      from: TrackDirection;
      to: TrackDirection;
    };
  };

  setTrackSettings: (settings: {
    angle?: TrackAngle;
    variation?: TrackVariation;
    direction?: { from: TrackDirection; to: TrackDirection };
  }) => void;

  nextTrackBlock: TrackBlockType | 'blocked' | 'closed';

  setNextTrackBlock: (nextTrackBlock: TrackBlockType | 'blocked' | 'closed') => void;

  chunkGeometries: BufferGeometry[];

  setChunkGeometry: (geometry: BufferGeometry, index: number) => void;
};

const interfaceStore = create<InterfaceStore>()(
  devtools(
    (set, get) => ({
      blockHovered: null,

      setBlockHovered: (blockHovered) => {
        set((state) => ({ blockHovered }));
      },

      blocksHovered: null,

      setBlocksHovered: (blocksHovered) => {
        set((state) => ({ blocksHovered }));
      },

      blockMutated: null,

      setBlockMutated: (blockMutated) => {
        set(() => ({ blockMutated }));
      },

      currUISelection: null,

      setCurrUISelection: (selection) => set(() => ({ currUISelection: selection })),

      isGeneratingWorld: false,

      toggleGeneratingWorld: (toggle: boolean) => {
        set(() => ({ isGeneratingWorld: toggle }));
      },

      trackSettings: {
        angle: TrackAngle.STRAIGHT,
        variation: TrackVariation.FORWARD,
        direction: {
          from: TrackDirection.NORTH,
          to: TrackDirection.SOUTH,
        },
      },

      setTrackSettings: (settings) => {
        const angle = settings.angle !== undefined ? settings.angle : get().trackSettings.angle;
        const variation = settings.variation !== undefined ? settings.variation : get().trackSettings.variation;
        const direction = settings.direction !== undefined ? settings.direction : get().trackSettings.direction;

        set(() => ({ trackSettings: { angle, variation, direction } }));
      },

      nextTrackBlock: 'blocked',

      setNextTrackBlock: (nextTrackBlock) => {
        set(() => ({ nextTrackBlock }));
      },

      //

      chunkGeometries: [],

      setChunkGeometry: (geometry: BufferGeometry, index: number) => {
        const chunkGeometries = get().chunkGeometries;
        chunkGeometries[index] = geometry;

        set(() => ({ chunkGeometries }));
      },
    }),
    { name: 'Interface store' },
  ),
);

const useInterfaceStore = createHook(interfaceStore);

export { interfaceStore, useInterfaceStore };
