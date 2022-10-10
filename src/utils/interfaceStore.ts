import { BufferGeometry, Vector3 } from 'three';
import createHook from 'zustand';
import { devtools } from 'zustand/middleware';
import create from 'zustand/vanilla';
// import { DirectionAngle } from '../components/Road';
import { BlockType } from './blockUtils';
import { UISelection } from './interfaceUtils';

type InterfaceStore = {
  blockHovered: { block: BlockType; vertex: { index: number; position: Vector3 }; geometry: BufferGeometry } | null;

  setBlockHovered: (
    blockHovered: { block: BlockType; vertex: { index: number; position: Vector3 }; geometry: BufferGeometry } | null
  ) => void;

  blockMutated: { block: BlockType; vertex: { index: number; position: Vector3 }; geometry: BufferGeometry } | null;

  setBlockMutated: (
    blockMutated: { block: BlockType; vertex: { index: number; position: Vector3 }; geometry: BufferGeometry } | null
  ) => void;

  currUISelection: UISelection | null;

  setCurrUISelection: (selection: UISelection | null) => void;

  // currEditRoadAngle: DirectionAngle;

  // setEditRoadAngle: (angle: DirectionAngle) => void;
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

      // currEditRoadAngle: DirectionAngle.STRAIGHT,

      // setEditRoadAngle: (angle) => set(() => ({ currEditRoadAngle: angle })),
    }),
    { name: 'Interface store' }
  )
);

const useInterfaceStore = createHook(interfaceStore);

export { interfaceStore, useInterfaceStore };
