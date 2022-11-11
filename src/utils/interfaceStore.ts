import { BufferGeometry, Vector3 } from 'three';
import createHook from 'zustand';
import { devtools } from 'zustand/middleware';
import create from 'zustand/vanilla';
// import { DirectionAngle } from '../components/Road';
import { BlockType } from './blockUtils';
import { UISelection } from './interfaceUtils';
import { TrackAngle, TrackBlockType, TrackVariation } from 'core/Track';

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
    } | null
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
    } | null
  ) => void;

  currUISelection: UISelection | null;

  setCurrUISelection: (selection: UISelection | null) => void;

  isGeneratingWorld: boolean;

  toggleGeneratingWorld: (toggle: boolean) => void;

  trackSettings: {
    angle: TrackAngle;
    variation: TrackVariation;
  };

  setTrackSettings: (settings: { angle?: TrackAngle; variation?: TrackVariation }) => void;

  nextTrackBlock: TrackBlockType | 'blocked' | 'closed';

  setNextTrackBlock: (nextTrackBlock: TrackBlockType | 'blocked' | 'closed') => void;
};

const interfaceStore = create<InterfaceStore>()(
  devtools(
    (set, get) => ({
      blockHovered: null,

      setBlockHovered: (blockHovered) => {
        set((state) => ({ blockHovered }));
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

      trackSettings: { angle: TrackAngle.STRAIGHT, variation: TrackVariation.FORWARD },

      setTrackSettings: (settings) => {
        const angle = settings.angle !== undefined ? settings.angle : get().trackSettings.angle;
        const variation = settings.variation !== undefined ? settings.variation : get().trackSettings.variation;

        set(() => ({ trackSettings: { angle, variation } }));
      },

      nextTrackBlock: 'blocked',

      setNextTrackBlock: (nextTrackBlock) => {
        set(() => ({ nextTrackBlock }));
      },
    }),
    { name: 'Interface store' }
  )
);

const useInterfaceStore = createHook(interfaceStore);

export { interfaceStore, useInterfaceStore };
