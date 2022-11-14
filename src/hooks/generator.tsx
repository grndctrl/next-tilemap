import { animated } from "@react-spring/web";
import Heightmap from "components/Heightmap";
import Button from "ui/Button";
import InputRange from "ui/InputRange";
import InputText from "ui/InputText";
import Progress from "ui/Progress";
import { useWorldGenerator } from "core/World";
import { WorldGeneratorState } from "core/World/hooks";
import { useTrackGenerator } from "core/Track/hooks";
import type { NextPage } from "next";
import { ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import { Vector3 } from "three";
import { blocksInChunk } from "utils/constants";
import { generateHeightmap } from "utils/worldUtils";
import Scene from "../components/Scene";
import { useInterfaceStore } from "utils/interfaceStore";
import { config } from "utils/colors";
import data from "./../../public/data.json";

const useImporter = () => {
  const {
    state: worldGeneratorState,
    initFromJSON: initWorldFromJSON,
    progress: worldProgress,
  } = useWorldGenerator();
  const { initFromJSON: initTrackFromJSON } = useTrackGenerator();

  const [isLoading, toggleLoading] = useState<boolean>(true);
  const state = useRef<number>(0);
  const progress = useRef<number>(0);

  const init = useCallback(() => {
    initWorldFromJSON(data.world);
    initTrackFromJSON(data.track);
  }, []);

  useEffect(() => {
    if (worldGeneratorState === 1) {
      state.current = 1;
      progress.current = 1 / 5;
    } else if (worldGeneratorState === 2 || worldGeneratorState === 3) {
      state.current = 2;
      progress.current = 2 / 5;
    } else if (worldGeneratorState === 4 || worldGeneratorState === 5) {
      state.current = 3;
      progress.current = 3 / 5;
    } else if (worldGeneratorState === 6 || worldGeneratorState === 7) {
      state.current = 4;
      progress.current = 4 / 5;
    } else if (worldGeneratorState === 8) {
      state.current = 5;
      progress.current = 5 / 5;
      toggleLoading(false);
    }
  }, [worldGeneratorState]);

  return { progress, state, init, isLoading };
};

export { useImporter };
