import { useCallback } from 'react';
import { Vector3 } from 'three';
import createHook from 'zustand';
import create from 'zustand/vanilla';
import { track, TrackDirectionType, TrackType } from './';

interface TrackState {
  trackRenderKeys: number[];
  resetTrackRenderKeys: (maxLength: number) => void;
  updateTrackRenderKey: (index: number) => void;
}

const globalStore = create<TrackState>()((set, get) => ({
  trackRenderKeys: [],

  resetTrackRenderKeys: (maxLength: number) => {
    const trackRenderKeys = Array.from({ length: maxLength }).map(() => 0);
    set(() => ({ trackRenderKeys }));
  },

  updateTrackRenderKey: (index) => {
    const trackRenderKeys = get().trackRenderKeys.slice();
    trackRenderKeys[index]++;
    set(() => ({ trackRenderKeys }));
  },
}));

const useGlobalStore = createHook(globalStore);

const useTrack = () => {
  const { trackRenderKeys, resetTrackRenderKeys, updateTrackRenderKey } = useGlobalStore();

  const getBlock = useCallback((query: number | Vector3) => track.getBlock(query), []);

  const setBlock = useCallback(
    (block: { id: number; worldPosition: Vector3; direction: TrackDirectionType; track: TrackType }) => {
      updateTrackRenderKey(block.id);
      track.setBlock(block);
    },
    [updateTrackRenderKey]
  );

  return {
    trackRenderKeys,
    resetTrackRenderKeys,
    updateTrackRenderKey,
    getBlock,
    setBlock,
  };
};

export { useTrack };
