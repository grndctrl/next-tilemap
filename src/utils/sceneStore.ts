import { BufferGeometry } from 'three';
import createHook from 'zustand';
import { devtools } from 'zustand/middleware';
import create from 'zustand/vanilla';
// import { DirectionAngle } from '../components/Road';

type SceneStore = {
  chunkGeometries: BufferGeometry[];

  setChunkGeometry: (geometry: BufferGeometry, index: number) => void;
};

const sceneStore = create<SceneStore>()(
  devtools(
    (set, get) => ({
      chunkGeometries: [],

      setChunkGeometry: (geometry: BufferGeometry, index: number) => {
        const chunkGeometries = get().chunkGeometries;
        chunkGeometries[index] = geometry;

        set(() => ({ chunkGeometries }));
      },
    }),
    { name: 'Scene store' },
  ),
);

const useSceneStore = createHook(sceneStore);

export { sceneStore, useSceneStore };
