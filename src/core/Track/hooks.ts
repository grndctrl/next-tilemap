import { useCallback } from 'react';
import { Vector3 } from 'three';
import createHook from 'zustand';
import create from 'zustand/vanilla';
import { track, TrackBlockType, TrackDirectionType, TrackType } from './';

interface TrackState {
  trackRenderKeys: number[];

  resetTrackRenderKeys: (maxLength: number) => void;

  updateTrackRenderKey: (index: number) => void;

  length: number;

  setLength: (length: number) => void;
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

  length: 0,

  setLength: (length) => {
    set(() => ({ length }));
  },
}));

const useGlobalStore = createHook(globalStore);

const useTrack = () => {
  const { trackRenderKeys, resetTrackRenderKeys, updateTrackRenderKey, length, setLength } = useGlobalStore();

  const getBlock = useCallback((query: number | Vector3) => track.getBlock(query), []);

  const setBlock = useCallback(
    (block: TrackBlockType) => {
      updateTrackRenderKey(block.id);
      track.setBlock(block);
      setLength(block.id + 1);
    },
    [setLength, updateTrackRenderKey]
  );

  return {
    trackRenderKeys,
    resetTrackRenderKeys,
    updateTrackRenderKey,
    getBlock,
    setBlock,
    length,
  };
};

export { useTrack };
