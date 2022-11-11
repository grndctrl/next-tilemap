import { useCallback } from 'react';
import { Vector3 } from 'three';
import createHook from 'zustand';
import create from 'zustand/vanilla';
import { track, TrackBlockType, TrackDirectionType, TrackType, TrackVariation } from './';

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

  const deleteBlock = useCallback(() => {
    console.log(track);
    const block = track.getBlock(length - 1);

    if (block) {
      block.track.variation = TrackVariation.EMPTY;
      track.setBlock(block);
    }

    setLength(length - 1);
  }, [length, setLength]);

  const exportJSON = useCallback(() => {
    return track.exportJSON();
  }, []);

  return {
    trackRenderKeys,
    resetTrackRenderKeys,
    updateTrackRenderKey,
    getBlock,
    setBlock,
    deleteBlock,
    length,
    exportJSON,
  };
};

export { useTrack };
